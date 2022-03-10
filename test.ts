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
  Validator,
  any,
  lazy,
  except,
  ExactTypes,
  IValidationError,
  PossibleTypeof,
  transform,
  predicate,
  replaceError,
  ValidationError,
  chain,
  fallback,
  validate,
} from "./lib";
import { strict as assert } from "assert";

const date = () =>
  predicate(
    chain(
      string(),
      transform((value) => new Date(value))
    ),
    (d) => {
      return !isNaN(d.getTime());
    }
  );

const assertValidator = <T>(v: Validator<T>, value: T, intent: string = "") => {
  const validation = v.validate(value);
  assert(
    validation.isValid,
    `Should have been valid, but was invalid. ${intent}`
  );
  assert.deepEqual(
    validation.value,
    value,
    `Values do not match. ${value} !== ${validation.value}`
  );
};

const assertTransformValidator = <T>(
  v: Validator<T>,
  value: T,
  expected: any,
  intent: string = ""
) => {
  const validation = v.validate(value);
  assert(
    validation.isValid,
    `Should have been valid, but was invalid. ${intent}`
  );

  assert.deepEqual(validation.value, expected);
};

const assertIncorrect = <T>(
  v: Validator<T>,
  value: any,
  intent: string = "",
  errorValidator?: Validator<IValidationError>
) => {
  const validation = v.validate(value);
  assert(!validation.isValid, `Should not have been valid. ${intent}`);
  if (errorValidator) {
    if (validation.isValid === false) {
      assert(
        !errorValidator.validate(validation).isValid,
        "Failed to validate error object"
      );
    }
  }
};

{
  // chain

  const dateParse = () =>
    chain(
      transform((value) => new Date(value)),
      transform((value) => value.toISOString())
    );

  const expectedDateString = new Date(0).toISOString();

  const validation = dateParse().validate(0);
  assert(validation.isValid);
  assert.strictEqual(expectedDateString, validation.value);
}

{
  // exact

  const notExactErrorSchema = (validator: Validator<ExactTypes>) =>
    object({
      type: string(),
      errorMessage: string(),
      value: any(),
      expectedValue: validator,
    });

  assertValidator(exact("hello"), "hello", "Exact 'hello'");
  assertIncorrect(
    exact("hello"),
    "hah",
    "'hah' should not match 'hello'",
    notExactErrorSchema(exact("hello"))
  );
  assertValidator(exact(10), 10, "Exact '10'");
  assertIncorrect(
    exact(10),
    2,
    "'10' should not match '2'",
    notExactErrorSchema(exact(10))
  );
  assertValidator(exact(undefined), undefined, "Exact 'undefined'");
  assertIncorrect(
    exact(undefined),
    null,
    "'undefined' should not match 'null'",
    notExactErrorSchema(exact(undefined))
  );
  assertValidator(exact(null), null, "Exact 'null'");
  assertIncorrect(
    exact(null),
    undefined,
    "'null' should not match 'undefined'",
    notExactErrorSchema(exact(null))
  );
  assertValidator(exact(false), false, "Exact 'false'");
  assertIncorrect(
    exact(false),
    true,
    "'false' should not match 'true'",
    notExactErrorSchema(exact(false))
  );
  assertValidator(exact(true), true, "Exact 'true'");
  assertIncorrect(
    exact(true),
    false,
    "'true' should not match 'false'",
    notExactErrorSchema(exact(true))
  );
  assertValidator(exact(NaN), NaN, "NaN should equal to NaN");
  assertIncorrect(
    exact(NaN),
    1,
    "NaN and 1 are not equal",
    notExactErrorSchema(exact(NaN))
  );
}

{
  const unexpectedTypeofErrorSchema = (validator: PossibleTypeof) =>
    object({
      type: string(),
      errorMessage: string(),
      value: any(),
      expectedType: exact(validator),
    });

  // string
  assertValidator(string(), "haha", "Should validate string");
  assertValidator(string(), "sweet", "Should validate string");
  assertIncorrect(
    string(),
    10,
    "Incorrect types should not match",
    unexpectedTypeofErrorSchema("string")
  );
}

{
  // boolean

  const unexpectedTypeofErrorSchema = (validator: PossibleTypeof) =>
    object({
      type: string(),
      errorMessage: string(),
      value: any(),
      expectedType: exact(validator),
    });

  assertValidator(boolean(), true, "the boolean 'true' is a boolean");
  assertValidator(boolean(), true, "the boolean 'false' is a boolean");
  assertIncorrect(
    boolean(),
    10,
    "a number is not a boolean",
    unexpectedTypeofErrorSchema("boolean")
  );
}

{
  // number

  const unexpectedTypeofErrorSchema = (validator: PossibleTypeof) =>
    object({
      type: string(),
      errorMessage: string(),
      value: any(),
      expectedType: exact(validator),
    });

  assertValidator(number(), 42, "A number should be a valid number");
  assertValidator(number(), 24, "A number should be a valid nubmer");
  assertIncorrect(number(), "Sweet", "A string is not a valid number");
  assertIncorrect(
    boolean(),
    10,
    "a number is not a boolean",
    unexpectedTypeofErrorSchema("boolean")
  );
}

{
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

  const validation = objectWithDate.validate(objectUnderTest);

  assert(validation.isValid);
  assert(typeof validation.value.cool === "string");
  assert(typeof validation.value.nice === "number");
  assert(validation.value.whenCreated instanceof Date);

  assertValidator(object({}), {}, "An empty object is a valid empty object");
  assertValidator(
    object({ sweet: number() }),
    { sweet: 10 },
    "The object should match the schema"
  );
  assertValidator(
    object({ sweet: exact("cool") }),
    { sweet: "cool" },
    "The object should match the schema"
  );
  assertValidator(
    object({ sweet: either(exact("cool"), exact(undefined)) }),
    {} as any,
    "An empty object is a valid object where the only field is optional"
  );
  assertValidator(
    object({}),
    { sweet: "cool" },
    "An object with fields is a valid empty object"
  );
  assertValidator(
    object({ sweet: exact("cool"), nice: exact("bar") }),
    {
      sweet: "cool",
      nice: "bar",
      woot: 42,
    } as any,
    "An object with more fields is certainly a valid object according to the schema"
  );
  assertIncorrect(
    object({ sweet: exact("cool") }),
    { sweet: 10 },
    "An object not matching the schema should fail the test"
  );
  assertIncorrect(
    object({ sweet: exact("cool") }),
    "haha",
    "An object not matching the schema should fail the test"
  );
}

{
  // either
  assertValidator(
    either(number(), string()),
    42,
    "A number is either a valid string or a number"
  );
  assertValidator(
    either(number(), string()),
    24,
    "A number is a valid string or a number"
  );
  assertValidator(
    either(number(), string()),
    "a",
    "A string is a valid string or a number"
  );
  assertValidator(
    either(number(), string()),
    "b",
    "A string is a valid string or a number"
  );
  assertIncorrect(
    either(number(), string()),
    false,
    "A boolean is neither a string nor a number"
  );

  const dateResult = either(number(), date()).validate(
    new Date().toISOString()
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
}

{
  // arrayOf

  const date = () =>
    predicate(
      chain(
        string(),
        transform((value) => new Date(value))
      ),
      (d) => !isNaN(d.getTime())
    );

  assertValidator(
    arrayOf(number()),
    [42],
    "An array with a single number is a valid array of numbers"
  );
  assertValidator(
    arrayOf(number()),
    [24, 24],
    "An array with two numbers is a valid array of numbers"
  );
  assertValidator(
    arrayOf(number()),
    [24, 2],
    "An array with two numbers is a valid array of numbers"
  );
  assertValidator(
    arrayOf(either(number(), string())),
    [24, 2, "foo"],
    "An array with two numbers and a string is a valid array of numbers and strings"
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
    "An array of a single string is not an array of numbers"
  );
  assertIncorrect(
    arrayOf(either(number(), boolean())),
    ["nice"],
    "An array of a single string is not an array of numbers and booleans"
  );
}

{
  // objectOf

  assertValidator(
    objectOf(number()),
    { a: 42 },
    "An object with a number field is indeed an object of numbers"
  );
  assertValidator(
    objectOf(number()),
    { a: 42, b: 43 },
    "An object with two number fields is indeed an object of numbers"
  );
  assertValidator(
    objectOf(either(number(), string())),
    {
      a: 42,
      b: 43,
      c: "string",
    },
    "An object with two string fields, and one number field is an object of numbers and strings"
  );
  assertIncorrect(
    objectOf(number()),
    {
      a: 42,
      b: 43,
      c: "string",
    },
    "An object of numbers and strings is not an object of numbers"
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
      chain(
        string(),
        transform((value) => new Date(value))
      ),
      (d) => {
        return !isNaN(d.getTime());
      }
    );

  const validation = objectOf(date()).validate(obj);
  assert(validation.isValid);
  Object.keys(validation.value).map((key) =>
    assert(validation.value[key] instanceof Date)
  );
}

{
  // tuple
  assertValidator(
    tuple([string(), number()]),
    ["1", 1],
    "An array with a number and then a string is an array with a number and then a string"
  );
  assertIncorrect(
    tuple([string(), number()]),
    [1, "1"],
    "An array with a string and then a number is not an array with a number and then a string"
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
}

{
  // except
  assertValidator(
    except(string(), exact("but")),
    "hello",
    'The string `"hello"` is not "but", so the string should be valid'
  );

  assertIncorrect(
    except(string(), exact("but")),
    "but",
    'The string "but" is "but" so the validation should have failed'
  );
}

{
  // any
  assertValidator(any(), "", "Any. Shouldn't matter");
  assertValidator(any(), 10, "Any. Shouldn't matter");
  assertValidator(any(), 6, "Any. Shouldn't matter");
  assertValidator(any(), {}, "Any. Shouldn't matter");
  assertValidator(any(), { sweet: "cool" }, "Any. Shouldn't matter");
  assertValidator(any(), [], "Any. Shouldn't matte");
  assertValidator(any(), [{ haha: "cool" }], "Any. Shouldn't matter");
}

{
  // lazy
  assertValidator(
    lazy(() => object({})),
    {},
    "An empty object is a valid empty object"
  );
  assertValidator(
    lazy(() => object({ sweet: number() })),
    { sweet: 10 },
    "The object should match the schema"
  );
  assertValidator(
    lazy(() => object({ sweet: exact("cool") })),
    { sweet: "cool" },
    "The object should match the schema"
  );
  assertValidator(
    lazy(() => object({ sweet: either(exact("cool"), exact(undefined)) })),
    {} as any,
    "An empty object is a valid object where the only field is optional"
  );
  assertValidator(
    lazy(() => object({})),
    { sweet: "cool" },
    "An object with fields is a valid empty object"
  );
  assertValidator(
    lazy(() => object({ sweet: exact("cool"), nice: exact("bar") })),
    {
      sweet: "cool",
      nice: "bar",
      woot: 42,
    } as any,
    "An object with more fields is certainly a valid object according to the schema"
  );
  assertIncorrect(
    lazy(() => object({ sweet: exact("cool") })),
    { sweet: 10 },
    "An object not matching the schema should fail the test"
  );
  assertIncorrect(
    lazy(() => object({ sweet: exact("cool") })),
    "haha",
    "An object not matching the schema should fail the test"
  );

  // Recursive nodes

  type Node = {
    value: any;
    left: Node | null;
    right: Node | null;
  };

  const node: Validator<Node> = lazy<Node>(() =>
    object({
      value: any(),
      left: either(node, exact(null)),
      right: either(node, exact(null)),
    })
  );

  assertValidator(
    node,
    { value: "sweet", left: null, right: null },
    "An object without nested nodes should be fine"
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
    "An object with  nested left node should be fine"
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
    "Deeply nested objects should be fine"
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
    "Nested values should not go unchecked"
  );

  const dateParse = lazy(() => date());
  const validation = dateParse.validate(new Date().toISOString());
  assert(validation.isValid);
  assert(validation.value instanceof Date);
}

{
  // transform

  const notExactErrorSchema = () =>
    object({
      type: string(),
      errorMessage: string(),
      value: any(),
      errorObject: object({}),
    });

  const jsonParser = () => transform((value) => JSON.parse(value));
  assertTransformValidator(
    jsonParser(),
    "{}",
    {},
    "Expected empty object to parse"
  );
  assertIncorrect(
    jsonParser(),
    "hello",
    "Should not have been valid",
    notExactErrorSchema()
  );
}

{
  const predicateError = () =>
    object({
      type: string(),
      errorMessage: string(),
      value: any(),
    });

  const minString = (length: number) =>
    predicate(string(), (value) => value.length >= length);

  assertValidator(
    minString(5),
    "Vancouver",
    "Expected that the string 'Vancouver' be evaluated to have a minimum length of 5"
  );

  assertIncorrect(
    minString(10),
    "Vancouver",
    "Expected that the string 'Vancouver' be evaluated not have a length of at least 10",
    predicateError()
  );

  const date = predicate(
    chain(
      string(),
      transform((value) => new Date(value))
    ),
    (v) => !isNaN(v.getTime())
  );

  const d = new Date().toISOString();

  const validation = date.validate(d);
  assert(validation.isValid);
  assert(validation.value instanceof Date);
}

{
  const type = "Custom error";
  const errorMessage = "Some custom error message";
  const customMessage = "This is a custom message";

  const customError = () =>
    object({
      type: exact(type),
      errorMessage: exact(errorMessage),
      value: any(),
      customMessage: exact(customMessage),
    });

  class CustomError extends ValidationError {
    constructor(value: any, public customMessage: string) {
      super(type, errorMessage, value);
    }
  }

  const validator = replaceError(
    string(),
    (value) => new CustomError(value, customMessage)
  );

  assertIncorrect(
    validator,
    25,
    "An error should have happened, but it didn't",
    customError()
  );

  const validationSynthesis = replaceError(
    date(),
    (value) => new CustomError(value, customMessage)
  ).validate(new Date().toISOString());

  assert(validationSynthesis.isValid);
  assert(validationSynthesis.value instanceof Date);
}

{
  // chain

  const assertDateEqual = (
    v: Validator<Date>,
    value: string,
    intent: string = ""
  ) => {
    const validation = v.validate(value);
    assert(
      validation.isValid,
      `Should have been valid, but was invalid. ${intent}`
    );
    assert.equal(
      validation.value.toISOString(),
      value,
      `Values do not match. ${value} !== ${validation.value.toISOString()}`
    );
  };

  const isoString = "1970-01-01T00:00:00.000Z";

  const date = chain(
    string(),
    transform((value) => new Date(value))
  );

  assertDateEqual(date, isoString);
  assertIncorrect(date, 10, "Number is not a string");
}

{
  // fallback

  const assertFallbackEqual = <T>(
    v: Validator<T>,
    incorrectValue: any,
    fallbackValue: T,
    intent: string = ""
  ) => {
    const validation = v.validate(incorrectValue);
    assert(
      validation.isValid,
      `Should have been valid, but was invalid. ${intent}`
    );
    assert.equal(
      validation.value,
      fallbackValue,
      `Values do not match. ${fallback} !== ${validation.value}`
    );
  };

  assertFallbackEqual(
    fallback(string(), () => ""),
    10,
    "",
    "There should be an empty string fallback"
  );

  const dateFallback = fallback(date(), () => undefined as undefined);

  const validation = dateFallback.validate(new Date(0).toString());

  assert(validation.isValid);
  assert(validation.value instanceof Date);
}

{
  // Validate

  const schema = string();

  let failed = false;
  try {
    validate(schema, 1);
  } catch (e) {
    failed = true;
  }

  assert(failed);
}
