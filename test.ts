import {
  exact,
  string,
  number,
  arrayOf,
  either,
  objectOf,
  object,
  boolean,
  tuple,
  type Validator,
  lazy,
  except,
  exclude,
  type ExactTypes,
  type IValidationError,
  type PossibleTypeof,
  transform,
  predicate,
  replaceError,
  ValidationError,
  chain,
  fallback,
  validate,
  intersection,
  unknown,
  instance,
} from "./lib.ts";
import { test } from "node:test";
import { strict as assert } from "node:assert";

const date = () =>
  predicate(
    transform(string(), (value) => new Date(value)),
    (d) => {
      return !isNaN(d.getTime());
    },
  );

const assertValidator = <T>(v: Validator<T>, value: T, intent: string = "") => {
  const validation = v.validate(value);
  assert(
    validation.isValid,
    `Should have been valid, but was invalid. ${intent}`,
  );
  assert.deepEqual(
    validation.value,
    value,
    `Values do not match. ${value} !== ${validation.value}`,
  );
};

const assertTransformValidator = <T>(
  v: Validator<T>,
  value: T,
  expected: any,
  intent: string = "",
) => {
  const validation = v.validate(value);
  assert(
    validation.isValid,
    `Should have been valid, but was invalid. ${intent}`,
  );

  assert.deepEqual(validation.value, expected);
};

const assertIncorrect = <T>(
  v: Validator<T>,
  value: any,
  intent: string = "",
  errorValidator?: Validator<IValidationError>,
) => {
  const validation = v.validate(value);
  assert(!validation.isValid, `Should not have been valid. ${intent}`);
  if (errorValidator) {
    if (validation.isValid === false) {
      assert(
        !errorValidator.validate(validation).isValid,
        "Failed to validate error object",
      );
    }
  }
};

test("instance", () => {
  // instance

  class Animal {
    public name: string;
    constructor(name: string) {
      this.name = name;
    }
  }
  class Dog extends Animal {}

  // A matching instance validates and returns the same reference.
  const now = new Date();
  const dateValidation = instance(Date).validate(now);
  assert(dateValidation.isValid);
  assert.strictEqual(dateValidation.value, now);

  // Non-instances fail.
  assertIncorrect(
    instance(Date),
    "2026-06-14",
    "A string is not an instance of Date",
  );
  assertIncorrect(
    instance(Date),
    {},
    "A plain object is not an instance of Date",
  );

  // Subclass instances satisfy a base-class validator.
  const dog = new Dog("Rex");
  const dogValidation = instance(Animal).validate(dog);
  assert(dogValidation.isValid);
  assert.strictEqual(dogValidation.value, dog);

  // But a base instance does not satisfy a subclass validator.
  assertIncorrect(
    instance(Dog),
    new Animal("generic"),
    "An Animal is not an instance of Dog",
  );

  // The failure carries the expected error type.
  const failure = instance(Date).validate("nope");
  assert(!failure.isValid);
  if (!failure.isValid) {
    assert.strictEqual(failure.error.type, "Not an instance error");
  }
});

test("exact", () => {
  // exact

  const notExactErrorSchema = (validator: Validator<ExactTypes>) =>
    object({
      type: string(),
      errorMessage: string(),
      value: unknown(),
      expectedValue: validator,
    });

  assertValidator(exact("hello"), "hello", "Exact 'hello'");
  assertIncorrect(
    exact("hello"),
    "hah",
    "'hah' should not match 'hello'",
    notExactErrorSchema(exact("hello")),
  );
  assertValidator(exact(10), 10, "Exact '10'");
  assertIncorrect(
    exact(10),
    2,
    "'10' should not match '2'",
    notExactErrorSchema(exact(10)),
  );
  assertValidator(exact(undefined), undefined, "Exact 'undefined'");
  assertIncorrect(
    exact(undefined),
    null,
    "'undefined' should not match 'null'",
    notExactErrorSchema(exact(undefined)),
  );
  assertValidator(exact(null), null, "Exact 'null'");
  assertIncorrect(
    exact(null),
    undefined,
    "'null' should not match 'undefined'",
    notExactErrorSchema(exact(null)),
  );
  assertValidator(exact(false), false, "Exact 'false'");
  assertIncorrect(
    exact(false),
    true,
    "'false' should not match 'true'",
    notExactErrorSchema(exact(false)),
  );
  assertValidator(exact(true), true, "Exact 'true'");
  assertIncorrect(
    exact(true),
    false,
    "'true' should not match 'false'",
    notExactErrorSchema(exact(true)),
  );
  assertValidator(exact(NaN), NaN, "NaN should equal to NaN");
  assertIncorrect(
    exact(NaN),
    1,
    "NaN and 1 are not equal",
    notExactErrorSchema(exact(NaN)),
  );
});

test("string", () => {
  const unexpectedTypeofErrorSchema = (validator: PossibleTypeof) =>
    object({
      type: string(),
      errorMessage: string(),
      value: unknown(),
      expectedType: exact(validator),
    });

  // string
  assertValidator(string(), "haha", "Should validate string");
  assertValidator(string(), "sweet", "Should validate string");
  assertIncorrect(
    string(),
    10,
    "Incorrect types should not match",
    unexpectedTypeofErrorSchema("string"),
  );
});

test("boolean", () => {
  // boolean

  const unexpectedTypeofErrorSchema = (validator: PossibleTypeof) =>
    object({
      type: string(),
      errorMessage: string(),
      value: unknown(),
      expectedType: exact(validator),
    });

  assertValidator(boolean(), true, "the boolean 'true' is a boolean");
  assertValidator(boolean(), true, "the boolean 'false' is a boolean");
  assertIncorrect(
    boolean(),
    10,
    "a number is not a boolean",
    unexpectedTypeofErrorSchema("boolean"),
  );
});

test("number", () => {
  // number

  const unexpectedTypeofErrorSchema = (validator: PossibleTypeof) =>
    object({
      type: string(),
      errorMessage: string(),
      value: unknown(),
      expectedType: exact(validator),
    });

  assertValidator(number(), 42, "A number should be a valid number");
  assertValidator(number(), 24, "A number should be a valid nubmer");
  assertIncorrect(number(), "Sweet", "A string is not a valid number");
  assertIncorrect(
    boolean(),
    10,
    "a number is not a boolean",
    unexpectedTypeofErrorSchema("boolean"),
  );
});

test("object", () => {
  // object

  const objectWithDate = object({
    cool: string(),
    nice: number(),
    whenCreated: date(),
  });

  const objectUnderTest = {
    cool: "sweet",
    nice: 10,
    whenCreated: new Date().toISOString(),
  };

  const objUnderTestPartial1 = {
    cool: "sweet",
    nice: 10,
  };

  const objUnderTestPartial2 = {
    cool: "sweet",
    whenCreated: new Date().toISOString(),
  };

  const objUnderTestPartial3 = {
    cool: "sweet",
  };

  const objUnderTestPartial4 = {
    nice: 10,
  };

  const objUnderTestPartial5 = {
    whenCreated: new Date().toISOString(),
  };

  const objUnderTestPartial6 = {};

  const validation = objectWithDate.validate(objectUnderTest);

  assert(validation.isValid);
  assert(typeof validation.value.cool === "string");
  assert(typeof validation.value.nice === "number");
  assert(validation.value.whenCreated instanceof Date);

  {
    const validation = objectWithDate.partial.validate(objUnderTestPartial1);

    assert(validation.isValid);
    assert(typeof validation.value.cool === "string");
    assert(typeof validation.value.nice === "number");
    assert(validation.value.whenCreated === undefined);
  }

  {
    const validation = objectWithDate.partial.validate(objUnderTestPartial2);

    assert(validation.isValid);
    assert(typeof validation.value.cool === "string");
    assert(typeof validation.value.nice === "undefined");
    assert(validation.value.whenCreated instanceof Date);
  }

  {
    const validation = objectWithDate.partial.validate(objUnderTestPartial3);

    assert(validation.isValid);
    assert(typeof validation.value.cool === "string");
    assert(typeof validation.value.nice === "undefined");
    assert(validation.value.whenCreated === undefined);
  }

  {
    const validation = objectWithDate.partial.validate(objUnderTestPartial4);

    assert(validation.isValid);
    assert(typeof validation.value.cool === "undefined");
    assert(typeof validation.value.nice === "number");
    assert(validation.value.whenCreated === undefined);
  }

  {
    const validation = objectWithDate.partial.validate(objUnderTestPartial5);

    assert(validation.isValid);
    assert(typeof validation.value.cool === "undefined");
    assert(typeof validation.value.nice === "undefined");
    assert(validation.value.whenCreated instanceof Date);
  }

  {
    const validation = objectWithDate.partial.validate(objUnderTestPartial6);

    assert(validation.isValid);
    assert(typeof validation.value.cool === "undefined");
    assert(typeof validation.value.nice === "undefined");
    assert(validation.value.whenCreated === undefined);
  }

  assertValidator(object({}), {}, "An empty object is a valid empty object");
  assertValidator(
    object({ sweet: number() }),
    { sweet: 10 },
    "The object should match the schema",
  );
  assertValidator(
    object({ sweet: exact("cool") }),
    { sweet: "cool" },
    "The object should match the schema",
  );
  assertValidator(
    object({ sweet: either(exact("cool"), exact(undefined)) }),
    {} as any,
    "An empty object is a valid object where the only field is optional",
  );
  assertValidator(
    object({}),
    { sweet: "cool" },
    "An object with fields is a valid empty object",
  );
  assertValidator(
    object({ sweet: exact("cool"), nice: exact("bar") }),
    {
      sweet: "cool",
      nice: "bar",
      woot: 42,
    } as any,
    "An object with more fields is certainly a valid object according to the schema",
  );
  assertIncorrect(
    object({ sweet: exact("cool") }),
    { sweet: 10 },
    "An object not matching the schema should fail the test",
  );
  assertIncorrect(
    object({ sweet: exact("cool") }),
    "haha",
    "An object not matching the schema should fail the test",
  );
});

test("either", () => {
  // either
  assertValidator(
    either(number(), string()),
    42,
    "A number is either a valid string or a number",
  );
  assertValidator(
    either(number(), string()),
    24,
    "A number is a valid string or a number",
  );
  assertValidator(
    either(number(), string()),
    "a",
    "A string is a valid string or a number",
  );
  assertValidator(
    either(number(), string()),
    "b",
    "A string is a valid string or a number",
  );
  assertIncorrect(
    either(number(), string()),
    false,
    "A boolean is neither a string nor a number",
  );

  const dateResult = either(number(), date()).validate(
    new Date().toISOString(),
  );
  assert(dateResult.isValid);
  assert(dateResult.value instanceof Date);

  const stringDate = new Date().toISOString();
  const stringresult = either(string(), date()).validate(stringDate);
  assert(stringresult.isValid);
  assert.strictEqual(stringresult.value, stringDate.toString());

  let eitherValidator = either(number(), string(), boolean());
  let another: Validator<number | string | boolean> = eitherValidator;
  assert(another.validate(1).isValid);
  assert(another.validate("").isValid);
  assert(another.validate(false).isValid);
});

test("arrayOf", () => {
  // arrayOf

  const date = () =>
    predicate(
      transform(string(), (value) => new Date(value)),
      (d) => !isNaN(d.getTime()),
    );

  assertValidator(
    arrayOf(number()),
    [42],
    "An array with a single number is a valid array of numbers",
  );
  assertValidator(
    arrayOf(number()),
    [24, 24],
    "An array with two numbers is a valid array of numbers",
  );
  assertValidator(
    arrayOf(number()),
    [24, 2],
    "An array with two numbers is a valid array of numbers",
  );
  assertValidator(
    arrayOf(either(number(), string())),
    [24, 2, "foo"],
    "An array with two numbers and a string is a valid array of numbers and strings",
  );
  assertValidator(arrayOf(date()), [], "Should work with empty array");

  const initialDate = new Date();
  const dates = Array(10)
    .fill(0)
    .map((_, i) => new Date(initialDate.getTime() + i));

  const strs = dates.map((d) => d.toISOString());
  const datesValidation = arrayOf(date()).validate(strs);
  assert(datesValidation.isValid);
  assert(datesValidation.value.every((v, i) => strs[i] === v.toISOString()));

  assertIncorrect(arrayOf(number()), 2, "A number is not an array");
  assertIncorrect(arrayOf(number()), "nice", "A string is not an array");
  assertIncorrect(
    arrayOf(number()),
    ["nice"],
    "An array of a single string is not an array of numbers",
  );
  assertIncorrect(
    arrayOf(either(number(), boolean())),
    ["nice"],
    "An array of a single string is not an array of numbers and booleans",
  );
});

test("objectOf", () => {
  // objectOf

  assertValidator(
    objectOf(number()),
    { a: 42 },
    "An object with a number field is indeed an object of numbers",
  );
  assertValidator(
    objectOf(number()),
    { a: 42, b: 43 },
    "An object with two number fields is indeed an object of numbers",
  );
  assertValidator(
    objectOf(either(number(), string())),
    {
      a: 42,
      b: 43,
      c: "string",
    },
    "An object with two string fields, and one number field is an object of numbers and strings",
  );
  assertIncorrect(
    objectOf(number()),
    {
      a: 42,
      b: 43,
      c: "string",
    },
    "An object of numbers and strings is not an object of numbers",
  );

  const obj = {
    a: "2022-03-08T04:53:34.447Z",
    b: "2022-03-08T04:53:35.447Z",
    c: "2022-03-08T04:53:36.447Z",
    d: "2022-03-08T04:53:37.447Z",
    e: "2022-03-08T04:53:38.447Z",
    f: "2022-03-08T04:53:39.447Z",
    g: "2022-03-08T04:53:40.447Z",
    h: "2022-03-08T04:53:41.447Z",
    i: "2022-03-08T04:53:42.447Z",
    j: "2022-03-08T04:53:43.447Z",
  };

  const date = () =>
    predicate(
      transform(string(), (value) => new Date(value)),
      (d) => {
        return !isNaN(d.getTime());
      },
    );

  const validation = objectOf(date()).validate(obj);
  assert(validation.isValid);
  Object.keys(validation.value).map((key) =>
    assert(validation.value[key] instanceof Date),
  );
});

test("tuple", () => {
  // tuple
  assertValidator(
    tuple([string(), number()]),
    ["1", 1],
    "An array with a number and then a string is an array with a number and then a string",
  );
  assertIncorrect(
    tuple([string(), number()]),
    [1, "1"],
    "An array with a string and then a number is not an array with a number and then a string",
  );

  const toTest = [1, new Date().toISOString()];

  const validation = tuple([number(), date()]).validate(toTest);
  assert(validation.isValid);
  assert.strictEqual(validation.value[0], 1);
  assert(validation.value[1] instanceof Date);

  let result: [string, number, boolean];

  const v = tuple([string(), number(), boolean()]).validate(["", 0, false]);
  assert(v.isValid);
  result = v.value;
});

test("except", () => {
  // except
  assertValidator(
    except(string(), exact("but")),
    "hello",
    'The string `"hello"` is not "but", so the string should be valid',
  );

  assertIncorrect(
    except(string(), exact("but")),
    "but",
    'The string "but" is "but" so the validation should have failed',
  );
});

test("lazy", () => {
  // lazy
  assertValidator(
    lazy(() => object({})),
    {},
    "An empty object is a valid empty object",
  );
  assertValidator(
    lazy(() => object({ sweet: number() })),
    { sweet: 10 },
    "The object should match the schema",
  );
  assertValidator(
    lazy(() => object({ sweet: exact("cool") })),
    { sweet: "cool" },
    "The object should match the schema",
  );
  assertValidator(
    lazy(() => object({ sweet: either(exact("cool"), exact(undefined)) })),
    {} as any,
    "An empty object is a valid object where the only field is optional",
  );
  assertValidator(
    lazy(() => object({})),
    { sweet: "cool" },
    "An object with fields is a valid empty object",
  );
  assertValidator(
    lazy(() => object({ sweet: exact("cool"), nice: exact("bar") })),
    {
      sweet: "cool",
      nice: "bar",
      woot: 42,
    } as any,
    "An object with more fields is certainly a valid object according to the schema",
  );
  assertIncorrect(
    lazy(() => object({ sweet: exact("cool") })),
    { sweet: 10 },
    "An object not matching the schema should fail the test",
  );
  assertIncorrect(
    lazy(() => object({ sweet: exact("cool") })),
    "haha",
    "An object not matching the schema should fail the test",
  );

  // Recursive nodes

  type Node = {
    value: any;
    left: Node | null;
    right: Node | null;
  };

  const node: Validator<Node> = lazy<Node>(() =>
    object({
      value: unknown(),
      left: either(node, exact(null)),
      right: either(node, exact(null)),
    }),
  );

  assertValidator(
    node,
    { value: "sweet", left: null, right: null },
    "An object without nested nodes should be fine",
  );

  assertValidator(
    node,
    {
      value: "sweet",
      left: {
        value: "nice",
        left: null,
        right: null,
      },
      right: null,
    },
    "An object with  nested left node should be fine",
  );

  assertValidator(
    node,
    {
      value: "sweet",
      left: {
        value: "nice",
        left: null,
        right: null,
      },
      right: {
        value: "cool",
        left: {
          value: "haha",
          left: null,
          right: null,
        },
        right: null,
      },
    },
    "Deeply nested objects should be fine",
  );

  assertIncorrect(
    node,
    {
      value: "sweet",
      left: {
        value: "nice",
        // left: null, // Missing anything on the left node
        right: null,
      },
      right: null,
    },
    "Nested values should not go unchecked",
  );

  const dateParse = lazy(() => date());
  const validation = dateParse.validate(new Date().toISOString());
  assert(validation.isValid);
  assert(validation.value instanceof Date);
});

test("transform", () => {
  // transform

  const notExactErrorSchema = () =>
    object({
      type: string(),
      errorMessage: string(),
      value: unknown(),
      errorObject: object({}),
    });

  const jsonParser = () =>
    transform(string(), (value) => JSON.parse(value));
  assertTransformValidator(
    jsonParser(),
    "{}",
    {},
    "Expected empty object to parse",
  );
  assertIncorrect(
    jsonParser(),
    "hello",
    "Should not have been valid",
    notExactErrorSchema(),
  );
});

test("block", () => {
  const predicateError = () =>
    object({
      type: string(),
      errorMessage: string(),
      value: unknown(),
    });

  const minString = (length: number) =>
    predicate(string(), (value) => value.length >= length);

  assertValidator(
    minString(5),
    "Vancouver",
    "Expected that the string 'Vancouver' be evaluated to have a minimum length of 5",
  );

  assertIncorrect(
    minString(10),
    "Vancouver",
    "Expected that the string 'Vancouver' be evaluated not have a length of at least 10",
    predicateError(),
  );

  const date = predicate(
    transform(string(), (value) => new Date(value)),
    (v) => !isNaN(v.getTime()),
  );

  const d = new Date().toISOString();

  const validation = date.validate(d);
  assert(validation.isValid);
  assert(validation.value instanceof Date);
});

test("block 2", () => {
  const type = "Custom error";
  const errorMessage = "Some custom error message";
  const customMessage = "This is a custom message";

  const customError = () =>
    object({
      type: exact(type),
      errorMessage: exact(errorMessage),
      value: unknown(),
      customMessage: exact(customMessage),
    });

  class CustomError extends ValidationError {
    public customMessage: string;

    constructor(value: any, customMessage: string) {
      super(type, errorMessage, value);
      this.customMessage = customMessage;
    }
  }

  const validator = replaceError(
    string(),
    (value) => new CustomError(value, customMessage),
  );

  assertIncorrect(
    validator,
    25,
    "An error should have happened, but it didn't",
    customError(),
  );

  const validationSynthesis = replaceError(
    date(),
    (value) => new CustomError(value, customMessage),
  ).validate(new Date().toISOString());

  assert(validationSynthesis.isValid);
  assert(validationSynthesis.value instanceof Date);
});

test("chain", () => {
  // chain

  const assertDateEqual = (
    v: Validator<Date>,
    value: string,
    intent: string = "",
  ) => {
    const validation = v.validate(value);
    assert(
      validation.isValid,
      `Should have been valid, but was invalid. ${intent}`,
    );
    assert.equal(
      validation.value.toISOString(),
      value,
      `Values do not match. ${value} !== ${validation.value.toISOString()}`,
    );
  };

  const isoString = "1970-01-01T00:00:00.000Z";

  const date = chain(
    string(),
    transform(string(), (value) => new Date(value)),
  );

  assertDateEqual(date, isoString);
  assertIncorrect(date, 10, "Number is not a string");
});

test("fallback", () => {
  // fallback

  const assertFallbackEqual = <T>(
    v: Validator<T>,
    incorrectValue: any,
    fallbackValue: T,
    intent: string = "",
  ) => {
    const validation = v.validate(incorrectValue);
    assert(
      validation.isValid,
      `Should have been valid, but was invalid. ${intent}`,
    );
    assert.equal(
      validation.value,
      fallbackValue,
      `Values do not match. ${fallback} !== ${validation.value}`,
    );
  };

  assertFallbackEqual(
    fallback(string(), () => ""),
    10,
    "",
    "There should be an empty string fallback",
  );

  const dateFallback = fallback(date(), () => undefined as undefined);

  const validation = dateFallback.validate(new Date(0).toString());

  assert(validation.isValid);
  assert(validation.value instanceof Date);
});

test("Validate", () => {
  // Validate

  const schema = string();

  let failed = false;
  try {
    validate(schema, 1);
  } catch (e) {
    failed = true;
  }

  assert(failed);
});

test("intersection", () => {
  // intersection

  const date1 = new Date(Date.now()).toISOString();
  const date2 = new Date(Date.now() + 1000).toISOString();

  // Objects

  const a = object({
    hello: string(),
    foo: number(),
    whenCreated: date(),
  });

  const b = object({
    hi: string(),
    bar: boolean(),
    whenUpdated: date(),
  });

  const valueA = {
    hello: "world",
    foo: 10,
    whenCreated: date1,
  };

  const valueB = {
    hi: "sweet",
    bar: false,
    whenUpdated: date2,
  };

  const combined = { ...valueA, ...valueB };

  const partialExpected = object({
    hello: string(),
    foo: number(),
    hi: string(),
    bar: boolean(),
  });

  const validation = intersection(a, b).validate(combined);

  assert(validation.isValid);

  const partialExpectedValidation = partialExpected.validate(validation.value);

  assert(partialExpectedValidation.isValid);

  assert(validation.value.whenCreated instanceof Date);
  assert(validation.value.whenUpdated instanceof Date);

  // Unions

  const abcd = either(exact("a"), exact("b"), exact("c"), exact("d"));
  const cdef = either(exact("c"), exact("d"), exact("e"), exact("f"));

  const cd = intersection(abcd, cdef);

  assert(!cd.validate("a").isValid);
  assert(!cd.validate("b").isValid);
  assert(cd.validate("c").isValid);
  assert(cd.validate("d").isValid);
  assert(!cd.validate("e").isValid);
  assert(!cd.validate("f").isValid);
});

// Returns the error from a validation that is expected to fail.
const getError = <T>(v: Validator<T>, value: unknown): IValidationError => {
  const validation = v.validate(value);
  assert(!validation.isValid, "Expected the validation to fail, but it passed");
  return validation.error;
};

test("error responses: unexpected typeof", () => {
  // The message should name the type that was actually received, not just say
  // "something else".
  {
    const error = getError(string(), 10);
    assert.strictEqual(error.type, "Unexpected typeof");
    assert.strictEqual(
      error.errorMessage,
      "Expected a value of type string, but got number",
    );
    assert.strictEqual(error.value, 10);
  }
  {
    const error = getError(number(), "nope");
    assert.strictEqual(
      error.errorMessage,
      "Expected a value of type number, but got string",
    );
  }
  {
    const error = getError(boolean(), 0);
    assert.strictEqual(
      error.errorMessage,
      "Expected a value of type boolean, but got number",
    );
  }
});

test("error responses: not an exact value", () => {
  // Both the expected and actual values should appear in the message, with
  // strings quoted so they are distinguishable from look-alike primitives.
  {
    const error = getError(exact("hello"), "hah");
    assert.strictEqual(error.type, "Incorrect value");
    assert.strictEqual(
      error.errorMessage,
      'Expected the value to equal exactly "hello", but got "hah"',
    );
    assert.strictEqual(error.value, "hah");
  }
  {
    // A string "10" is distinguishable from the number 10.
    const error = getError(exact("10"), 10);
    assert.strictEqual(
      error.errorMessage,
      'Expected the value to equal exactly "10", but got 10',
    );
  }
  {
    const error = getError(exact(10), 2);
    assert.strictEqual(
      error.errorMessage,
      "Expected the value to equal exactly 10, but got 2",
    );
  }
  {
    // describeValue: undefined, objects, arrays, and bigints are described by
    // kind rather than dumped in full.
    assert.strictEqual(
      getError(exact("x"), undefined).errorMessage,
      'Expected the value to equal exactly "x", but got undefined',
    );
    assert.strictEqual(
      getError(exact("x"), {}).errorMessage,
      'Expected the value to equal exactly "x", but got an object',
    );
    assert.strictEqual(
      getError(exact("x"), [1, 2]).errorMessage,
      'Expected the value to equal exactly "x", but got an array',
    );
    assert.strictEqual(
      getError(exact("x"), 10n).errorMessage,
      'Expected the value to equal exactly "x", but got 10n',
    );
  }
});

test("error responses: not an instance", () => {
  // The message should report what the value actually was: the constructor
  // name for objects, "null", or the typeof otherwise.
  {
    const error = getError(instance(Date), {});
    assert.strictEqual(error.type, "Not an instance error");
    assert.strictEqual(
      error.errorMessage,
      "Expected an instance of Date, but got an instance of Object",
    );
  }
  {
    const error = getError(instance(Date), []);
    assert.strictEqual(
      error.errorMessage,
      "Expected an instance of Date, but got an instance of Array",
    );
  }
  {
    const error = getError(instance(Date), "2026-06-14");
    assert.strictEqual(
      error.errorMessage,
      "Expected an instance of Date, but got string",
    );
  }
  {
    const error = getError(instance(Date), null);
    assert.strictEqual(
      error.errorMessage,
      "Expected an instance of Date, but got null",
    );
  }
});

test("error responses: exclude", () => {
  // Regression test: the error must carry the offending value, not a hardcoded
  // string. Previously `error.value` was the literal "Exclude error".
  const notAdmin = exclude(string(), exact("admin"));

  const error = getError(notAdmin, "admin");
  assert.strictEqual(error.type, "Exclude error");
  assert.strictEqual(
    error.errorMessage,
    "The value matched the excluded validator, so it was rejected",
  );
  assert.strictEqual(
    error.value,
    "admin",
    "The error should carry the offending value, not a hardcoded string",
  );

  // When the value fails the included validator, that validator's error is
  // surfaced instead.
  const typeError = getError(notAdmin, 42);
  assert.strictEqual(typeError.type, "Unexpected typeof");
});

test("error responses: except", () => {
  const everythingBut = except(string(), exact("but"));

  const error = getError(everythingBut, "but");
  assert.strictEqual(error.type, "Unexpected value error");
  assert.strictEqual(
    error.errorMessage,
    "The value matched the invalidator, so it was rejected",
  );
  assert.strictEqual(error.value, "but");
});

test("error responses: arrayOf", () => {
  // Not an array.
  {
    const error = getError(arrayOf(number()), "nope");
    assert.strictEqual(error.type, "Not an array error");
    assert.strictEqual(
      error.errorMessage,
      "Expected an array, but instead got something else",
    );
  }
  // Some elements invalid: the message should count failures against the total,
  // and the error should carry each bad element with its index.
  {
    const error = getError(arrayOf(number()), [1, "2", 3, "4"]);
    assert.strictEqual(error.type, "Array of invalid values");
    assert.strictEqual(
      error.errorMessage,
      "2 of the 4 elements failed to validate",
    );
    const badValues = (error as unknown as { badValues: { index: number }[] })
      .badValues;
    assert.deepStrictEqual(
      badValues.map((b) => b.index),
      [1, 3],
    );
  }
});

test("error responses: tuple", () => {
  // Not an array.
  {
    const error = getError(tuple([string(), number()]), "nope");
    assert.strictEqual(error.type, "Not an array error");
  }
  // Wrong length.
  {
    const error = getError(tuple([string(), number()]), ["only one"]);
    assert.strictEqual(error.type, "Unexpected array length error");
    assert.strictEqual(
      error.errorMessage,
      "Expected an array of length 2 but instead got 1",
    );
    assert.strictEqual(
      (error as unknown as { expectedLength: number }).expectedLength,
      2,
    );
  }
  // Right length, wrong element types: the issue count reflects the failures.
  {
    const error = getError(tuple([string(), number()]), [1, "1"]);
    assert.strictEqual(error.type, "Tuple error");
    assert.strictEqual(error.errorMessage, "The supplied tuple had 2 issues");
  }
});

test("error responses: object", () => {
  // Undefined.
  {
    const error = getError(object({ a: string() }), undefined);
    assert.strictEqual(error.type, "Value is undefined");
    assert.strictEqual(error.value, undefined);
  }
  // Not an object.
  {
    const error = getError(object({ a: string() }), "nope");
    assert.strictEqual(error.type, "Unexpected typeof");
    assert.strictEqual(
      error.errorMessage,
      "Expected a value of type object, but got string",
    );
  }
  // Faulty fields: each offending field is keyed by name with its own error.
  {
    const error = getError(object({ a: string(), b: number() }), {
      a: 1,
      b: "two",
    });
    assert.strictEqual(error.type, "Bad object");
    const faultyFields = (
      error as unknown as { faultyFields: { [key: string]: IValidationError } }
    ).faultyFields;
    assert.deepStrictEqual(Object.keys(faultyFields).sort(), ["a", "b"]);
    assert.strictEqual(faultyFields.a.type, "Unexpected typeof");
    assert.strictEqual(faultyFields.b.type, "Unexpected typeof");
  }
});

test("error responses: objectOf", () => {
  // objectOf distinguishes undefined, null, and non-objects.
  assert.strictEqual(
    getError(objectOf(number()), undefined).type,
    "Value is undefined",
  );
  assert.strictEqual(getError(objectOf(number()), null).type, "Value is null");
  assert.strictEqual(
    getError(objectOf(number()), 42).type,
    "Unexpected typeof",
  );

  // Faulty fields.
  const error = getError(objectOf(number()), { a: 1, b: "two" });
  assert.strictEqual(error.type, "Bad object");
});

test("error responses: either", () => {
  const error = getError(either(number(), string()), false);
  assert.strictEqual(error.type, "Either error");
  assert.strictEqual(
    error.errorMessage,
    "The provided value does not match any of the possible validators",
  );
  assert.strictEqual(error.value, false);
  // Every alternative's result is retained for inspection.
  const results = (error as unknown as { validationResults: unknown[] })
    .validationResults;
  assert.strictEqual(results.length, 2);
});

test("error responses: predicate", () => {
  const minLength = predicate(string(), (value) => value.length >= 8);
  const error = getError(minLength, "short");
  assert.strictEqual(error.type, "Predicate failure");
  assert.strictEqual(error.errorMessage, "The predicate failed to match");
  assert.strictEqual(error.value, "short");

  // A failure of the underlying validator surfaces that validator's error.
  assert.strictEqual(getError(minLength, 42).type, "Unexpected typeof");
});

test("error responses: transform", () => {
  const jsonParser = transform(string(), (value) => JSON.parse(value));
  const error = getError(jsonParser, "not json");
  assert.strictEqual(error.type, "Parsing error");
  assert.strictEqual(error.errorMessage, "Failed to parse the value");
  assert.strictEqual(error.value, "not json");
  // The thrown error is wrapped for inspection.
  assert(
    (error as unknown as { errorObject: unknown }).errorObject instanceof Error,
  );

  // A failure of the underlying validator short-circuits before parsing.
  assert.strictEqual(getError(jsonParser, 42).type, "Unexpected typeof");
});
