// it: should loop over values;
{
  const input = [1, 2, 3];
  const output = [];
  for (let o of input) {
    // @ts-ignore
    output.push(o);
  }

  input.toString() === output.toString();
}

// it: should correctly throw from loop
{
  const input = [1, 2, 3];
  let result = false;
  try {
    for (let _ of input) {
      throw "error";
    }
  } catch (e) {
    // ignore
    result = true;
  }
  result;
}
