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
      x <- 5
      x
    `)
  ).toEqual(5);
  expect(
    run(`
      x <- 5
      y <- 3
      x
    `)
  ).toEqual(5);
  expect(
    run(`
      x <- 5 * 10
      x
    `)
  ).toEqual(50);
});

test("supports reassignments", () => {
  expect(
    run(`
      x <- 5
      x <- 10
      x
    `)
  ).toEqual(10);
});

test("supports if statements", () => {
  expect(
    run(`
      if true
        10
      else
        20
      endif
    `)
  ).toEqual(10);
});

test("supports ifs without elses", () => {
  expect(
    run(`
      if true
        10
      endif
    `)
  ).toEqual(10);

  expect(
    run(`
      if false
        10
      endif
    `)
  ).toEqual(undefined);
});

test("supports functions", () => {
  expect(
    run(`
      fn add_two(n)
        return n + 2
      endfn

      add_two(20)
    `)
  ).toEqual(22);
});

test("supports higher order functions and function expressions", () => {
  expect(
    run(`
      fn make_adder(n)
        return fn add(m)
          return n + m
        endfn
      endfn

      add_five <- make_adder(5)
      add_five(20)
    `)
  ).toEqual(25);
});

test("supports recursive functions", () => {
  expect(
    run(`
      fn factorial(n)
        if n = 1
          return 1
        else
          return n * factorial(n-1)
        endif
      endfn

      factorial(10)
    `)
  ).toEqual(3628800);
});

test("supports functions with any number of arguments", () => {
  expect(
    run(`
      fn gimmeFive()
        return 5
      endfn
      gimmeFive()
    `)
  ).toEqual(5);

  expect(
    run(`
      fn add2(x, y)
        return x + y
      endfn
      add2(6, 5)
    `)
  ).toEqual(11);

  expect(
    run(`
      fn add4(x, y, z, w)
        return x + y + z + w
      endfn
      add4(10, 11, 12, 13)
    `)
  ).toEqual(46);
});

test("tokens are case-insensitive", () => {
  expect(
    run(`
      FN factorial(n)
        IF n = 1
          reTUrn 1
        ELSE
          return n * factorial(n-1)
        enDif
      ENDFN

      factorial(10)
    `)
  ).toEqual(3628800);
});

test("comparators are parsed above arithmetic operators", () => {
  expect(
    run(`
      x <- 10 * 4 < 9 * 5
      x
    `)
  ).toEqual(true);
  expect(
    run(`
      x <- 9 * 5 < 10 * 4
      x
    `)
  ).toEqual(false);
});

describe("Structs", () => {
  test("can create new structs", () => {
    expect(
      run(`
        STRUCT Person(name, age)

        me <- Person("Jordan", 28)
        me.name
      `)
    ).toEqual("Jordan");
  });

  test("can reassign fields", () => {
    expect(
      run(`
        struct Person (
          name,
          age
        )

        me <- Person("Jordan", 28)
        me.age <- 30
        me.age
      `)
    ).toEqual(30);
  });

  test("fields can be nested and accessed", () => {
    expect(
      run(`
        struct Name (first, last)
        struct Person (name, age)

        me <- Person(Name("Jordan", "Scales"), 28)
        me
          .name
          .last
      `)
    ).toEqual("Scales");
  });

  test.todo("cannot create new fields");
});
