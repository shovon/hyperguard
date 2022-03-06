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
} from "./lib";
import { strict as assert } from "assert";

const assertValidator = <T>(v: Validator<T>, value: T, intent: string = "") => {
  const validation = v.validate(value);
  assert(
    validation.isValid,
    `Should have been valid, but was invalid. ${intent}`
  );
  assert(
    validation.value === value,
    `Values do not match. ${value} !== ${validation.value}`
  );
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
  const notExactErrorSchema = (validator: Validator<ExactTypes>) =>
    object({
      type: string(),
      errorMessage: string(),
      value: any(),
      expectedValue: validator,
    });

  // exact
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
}

{
  // string
  assertValidator(string(), "haha", "Should validate string");
  assertValidator(string(), "sweet", "Should validate string");
  assertIncorrect(string(), 10, "Incorrect types should not match");
}

{
  // boolean
  assertValidator(boolean(), true, "the boolean 'true' is a boolean");
  assertValidator(boolean(), true, "the boolean 'false' is a boolean");
  assertIncorrect(boolean(), 10, "a number is not a boolean");
}

{
  // number
  assertValidator(number(), 42, "A number should be a valid number");
  assertValidator(number(), 24, "A number should be a valid nubmer");
  assertIncorrect(number(), "Sweet", "A string is not a valid number");
}

{
  // object
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
  // alternatives
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
}

{
  // arrayOf
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
}
