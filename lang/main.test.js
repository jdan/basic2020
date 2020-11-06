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

test("evaluates assignments", () => {
  expect(
    run(`
      X <- 5
      X
    `)
  ).toEqual(5);
  expect(
    run(`
      X <- 5
      Y <- 3
      X
    `)
  ).toEqual(5);
  expect(
    run(`
      X <- 5 * 10
      X
    `)
  ).toEqual(50);
});

test("supports reassignments", () => {
  expect(
    run(`
      X <- 5
      X <- 10
      X
    `)
  ).toEqual(10);
});

test("supports if statements", () => {
  expect(
    run(`
      IF TRUE
        10
      ELSE
        20
      END
    `)
  ).toEqual(10);
});

test("supports ifs without elses", () => {
  expect(
    run(`
      IF TRUE
        10
      END
    `)
  ).toEqual(10);

  expect(
    run(`
      IF FALSE
        10
      END
    `)
  ).toEqual(undefined);
});

test("supports functions", () => {
  expect(
    run(`
      FUNCTION ADDTWO(N)
        RETURN N + 2
      END

      ADDTWO(20)
    `)
  ).toEqual(22);
});

test("supports higher order functions and function expressions", () => {
  expect(
    run(`
      FUNCTION MAKEADDER(N)
        RETURN (FUNCTION ADD(M)
          RETURN N + M
        END)
      END

      add_five <- MAKEADDER(5)
      add_five(20)
    `)
  ).toEqual(25);
});

test("supports recursive functions", () => {
  expect(
    run(`
      FUNCTION FACTORIAL(N)
        IF N = 1
          RETURN 1
        ELSE
          RETURN N * FACTORIAL(N-1)
        END
      END

      FACTORIAL(10)
    `)
  ).toEqual(3628800);
});

test("tokens are case-insensitive", () => {
  expect(
    run(`
      function factorial(n)
        if n = 1
          return 1
        else
          return n * factorial(n-1)
        end
      end

      factorial(10)
    `)
  ).toEqual(3628800);
});
