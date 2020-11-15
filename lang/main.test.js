let run = require("./main.js");

expect.extend({
  toEvaluateTo(received, expected) {
    expect(run(received)).toEqual(expected);
    return { pass: true };
  },

  toPrint(received, expected) {
    console.log = jest.fn();
    run(received);

    let consoleOutput = console.log.mock.calls.map((call) => call.join(" "));

    expect(consoleOutput).toEqual(expected);
    return { pass: true };
  },
});

test("evaluates mathematical expressions left-recursively", () => {
  expect("1 + 1").toEvaluateTo(2);
  expect("2+2").toEvaluateTo(4);
  expect("3-1- 1").toEvaluateTo(1);
  expect("1*2*3*4").toEvaluateTo(24);
  expect("12/4/ 3").toEvaluateTo(1);
});

test("evaluates mathematical expressions with grouping", () => {
  expect("32-(1-1)").toEvaluateTo(32);
  expect("12 / (4 / 2)").toEvaluateTo(6);
});

test("evaluates comparisons", () => {
  expect("4 < 4").toEvaluateTo(false);
  expect("4 <= 4").toEvaluateTo(true);
  expect("5 > 5").toEvaluateTo(false);
  expect("5 >= 5").toEvaluateTo(true);
  expect("10 = 10").toEvaluateTo(true);
  expect("10 != 10").toEvaluateTo(false);
});

test("evaluates strings", () => {
  expect(`"Hello, world!"`).toEvaluateTo("Hello, world!");
  expect(`"I'll be quoted this way"`).toEvaluateTo("I'll be quoted this way");
  expect(`'"Run," she yelled'`).toEvaluateTo('"Run," she yelled');
});

test("evaluates assignments", () => {
  expect(`
    x <- 5
    x
  `).toEvaluateTo(5);
  expect(`
    x <- 5
    y <- 3
    x
  `).toEvaluateTo(5);
  expect(`
    x <- 5 * 10
    x
  `).toEvaluateTo(50);
});

test("supports reassignments", () => {
  expect(`
    x <- 5
    x <- 10
    x
  `).toEvaluateTo(10);
});

test("supports if statements", () => {
  expect(`
    if true
      10
    else
      20
    endif
  `).toEvaluateTo(10);
});

test("supports ifs without elses", () => {
  expect(`
    if true
      10
    endif
  `).toEvaluateTo(10);

  expect(`
    if false
      10
    endif
  `).toEvaluateTo(undefined);
});

test("supports functions", () => {
  expect(`
    fn add_two(n)
      return n + 2
    endfn

    add_two(20)
  `).toEvaluateTo(22);
});

test("supports higher order functions and function expressions", () => {
  expect(`
    fn make_adder(n)
      return fn add(m)
        return n + m
      endfn
    endfn

    add_five <- make_adder(5)
    add_five(20)
  `).toEvaluateTo(25);
});

test("supports recursive functions", () => {
  expect(`
    fn factorial(n)
      if n = 1
        return 1
      else
        return n * factorial(n-1)
      endif
    endfn

    factorial(10)
  `).toEvaluateTo(3628800);
});

test("supports functions with any number of arguments", () => {
  expect(`
    fn gimmeFive()
      return 5
    endfn
    gimmeFive()
  `).toEvaluateTo(5);

  expect(`
    fn add2(x, y)
      return x + y
    endfn
    add2(6, 5)
  `).toEvaluateTo(11);

  expect(`
    fn add4(x, y, z, w)
      return x + y + z + w
    endfn
    add4(10, 11, 12, 13)
  `).toEvaluateTo(46);
});

test("supports trailing commas in function definitions", () => {
  expect(`
    fn add4
    (
      x,
      y,
      z,
      w,
    )
      return x + y + z + w
    endfn
    add4(10, 11, 12, 13)
  `).toEvaluateTo(46);
});

test("supports trailing commas in function callls", () => {
  expect(`
    fn add4(x, y, z, w,)
      return x + y + z + w
    endfn
    add4 (
      10,
      11,
      12,
      13,
    )
  `).toEvaluateTo(46);
});

test("tokens are case-insensitive", () => {
  expect(`
    FN factorial(n)
      IF n = 1
        reTUrn 1
      ELSE
        return n * factorial(n-1)
      enDif
    ENDFN

    factorial(10)
  `).toEvaluateTo(3628800);
});

test("comparators are parsed above arithmetic operators", () => {
  expect(`
    x <- 10 * 4 < 9 * 5
    x
  `).toEvaluateTo(true);
  expect(`
    x <- 9 * 5 < 10 * 4
    x
  `).toEvaluateTo(false);
});

describe("Structs", () => {
  test("can create new structs", () => {
    expect(`
      STRUCT Person(name, age)

      me <- Person("Jordan", 28)
      PRINT(me.name)
    `).toPrint(["Jordan"]);
  });

  test("can reassign fields", () => {
    expect(`
      struct Person (
        name,
        age
      )

      me <- Person("Jordan", 28)
      me.age <- 30
      PRINT(me.name)
      PRINT(me.age)
    `).toPrint(["Jordan", "30"]);
  });

  test("fields can be nested and accessed", () => {
    expect(`
      struct Name (first, last)
      struct Person (name, age,)

      me <- Person(Name("Jordan", "Scales"), 28)
      me.name.first <- "nadroJ"
      PRINT(me.name.first)
      PRINT(
        me
        .name
        .last
      )
      PRINT(me.age)
    `).toPrint(["nadroJ", "Scales", "28"]);
  });

  test.todo("cannot create new fields");
});

describe("Preamble", () => {
  test.todo("Parses and renders a preamble");
});
