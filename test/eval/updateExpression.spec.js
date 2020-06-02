// test: correctly updates with postfix ++
let c = 0;
c++;
assert.equal(c, 1);

// test: correctly updates with postfix --
let c = 1;
c--;
assert.equal(c, 0);

// test: correctly updates with prefix ++
let c = 0;
++c;
assert.equal(c, 1);

// test: correctly updates with prefix --
let c = 1;
--c;
assert.equal(c, 0);
