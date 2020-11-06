let run = require("./main.js");

test("evaluates mathematical expressions left-recursively", () => {
  expect(run("1 + 1")).toEqual(2);
  expect(run("2+2")).toEqual(4);
  expect(run("3-1- 1")).toEqual(1);
  expect(run("1*2*3*4")).toEqual(24);
  expect(run("12/4/ 3")).toEqual(1);
});

test("evaluates mathematical expressions with grouping", () => {
  expect(run("32-(1-1)")).toEqual(32);
  expect(run("12 / (4 / 2)")).toEqual(6);
});

test("evaluates comparisons", () => {
  expect(run("4 < 4")).toEqual(false);
  expect(run("4 <= 4")).toEqual(true);
  expect(run("5 > 5")).toEqual(false);
  expect(run("5 >= 5")).toEqual(true);
  expect(run("10 = 10")).toEqual(true);
  expect(run("10 != 10")).toEqual(false);
});

test("evaluates strings", () => {
  expect(run(`"Hello, world!"`)).toEqual("Hello, world!");
  expect(run(`"I'll be quoted this way"`)).toEqual("I'll be quoted this way");
  expect(run(`'"Run," she yelled'`)).toEqual('"Run," she yelled');
});
