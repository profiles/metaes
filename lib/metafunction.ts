import { EvaluationConfig, OnSuccess, MetaesFunction, OnError } from "./types";
import { NotImplementedException } from "./exceptions";
import { evaluate } from "./applyEval";
import { callInterceptor, Environment } from "./environment";
import { FunctionNode } from "./nodeTypes";

// TODO: pass config also in evaluateMetaFunction: it can override or replace this from metaFunction
export const evaluateMetaFunction = (
  metaFunction: MetaesFunction,
  c: OnSuccess,
  cerr: OnError,
  thisObject: any,
  args: any[]
) => {
  const { e, closure, config } = metaFunction;
  try {
    const env = {
      prev: closure,
      values: { this: thisObject, arguments: args }
    };

    let i = 0;
    for (let param of e.params) {
      switch (param.type) {
        case "Identifier":
          env.values[param.name] = args[i++];
          break;
        case "RestElement":
          env.values[param.argument.name] = args.slice(i);
          break;
        default:
          const error = NotImplementedException(`Not supported type (${param["type"]}) of function param.`, param);
          config && config.onError && config.onError(error);
          throw error;
      }
    }
    config && callInterceptor(e, config, metaFunction, env, "enter");
    let _calledAfterInterceptor = false;

    function _interceptorAfter(e, value, env) {
      if (_calledAfterInterceptor) {
        return;
      }
      config && callInterceptor(e, config, value, env, "exit");
      _calledAfterInterceptor = true;
    }

    evaluate(
      e.body,
      env,
      config,
      result => {
        c(result);
        _interceptorAfter(e, result, env);
      },
      exception => {
        switch (exception.type) {
          case "ReturnStatement":
            c(exception.value);
            break;
          default:
            exception.location = e;
            cerr(exception);
            // TODO: needed?
            throw exception.value;
        }
        _interceptorAfter(e, exception.value, env);
      }
    );
  } catch (e) {
    cerr(e);
  }
};

export const createMetaFunctionWrapper = (metaFunction: MetaesFunction) =>
  function(this: any, ...args) {
    const config = metaFunction.config;
    let result;
    let error;
    evaluateMetaFunction(
      metaFunction,
      r => (result = r),
      exception => {
        error = exception.value;
        config && config.onError && config.onError(exception);
      },
      this,
      args
    );
    if (error) {
      throw error;
    }
    return result;
  };

export const createMetaFunction = (e: FunctionNode, closure: Environment, config: EvaluationConfig) =>
  createMetaFunctionWrapper({
    e,
    closure,
    config
  });
