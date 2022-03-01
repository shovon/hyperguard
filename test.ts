import {
  exact,
  nullable,
  optional,
  string,
  number,
  arrayOf,
  alternatives,
  objectOf,
  object,
  boolean,
  tuple,
  Validator,
  any,
  lazy,
} from "./lib";
import { strict as assert } from "assert";

// // TODO: document this
// type Node = {
//   value: any;
//   next: Node | null;
// };

// const next: Validator<Node> = object({
//   value: any(),
//   next: lazy(() => nullable(next)),
// });

const assertValidator = <T>(v: Validator<T>, value: T, intent: string = "") => {
  const validation = v.validate(value);
  assert(
    validation.valid,
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
  intent: string = ""
) => {
  const validation = v.validate(value);
  assert(!validation.valid, `Should not have been valid. ${intent}`);
};

{
  // exact
  assertValidator(exact("hello"), "hello", "Exact 'hello'");
  assertIncorrect(exact("hello"), "hah", "'hah' should not match 'hello'");
  assertValidator(exact(10), 10, "Exact '10'");
  assertIncorrect(exact(10), 2, "'10' should not match '2'");
  assertValidator(exact(undefined), undefined, "Exact 'undefined'");
  assertIncorrect(
    exact(undefined),
    null,
    "'undefined' should not match 'null'"
  );
  assertValidator(exact(null), null, "Exact 'null'");
  assertIncorrect(
    exact(null),
    undefined,
    "'null' should not match 'undefined'"
  );
  assertValidator(exact(false), false, "Exact 'false'");
  assertIncorrect(exact(false), true, "'false' should not match 'true'");
  assertValidator(exact(true), true, "Exact 'true'");
  assertIncorrect(exact(true), false, "'true' should not match 'false'");
}

{
  // string
  assertValidator(string(), "haha", "Should validate string");
  assertValidator(string(), "sweet", "Should validate string");
  assertValidator(
    string((s) => /a/.test(s)),
    "aaaab",
    "Should validate string with a predicate"
  );
  assertIncorrect(string(), 10, "Incorrect types should not match");
  assertIncorrect(
    string((s) => /a/.test(s)),
    "zzzzzb",
    "A string should not be validated if the predicate fails"
  );
}

{
  // optional
  assertValidator(
    optional(string()),
    "",
    "A defined optional string should be valid"
  );
  assertValidator(
    optional(string()),
    undefined,
    "An undefined optional string should be valid"
  );
  assertIncorrect(
    optional(string()),
    10,
    "A number is not a valid optional string"
  );
}

{
  // boolean
  assertValidator(boolean(), true, "the boolean 'true' is a boolean");
  assertValidator(boolean(), true, "the boolean 'false' is a boolean");
  assertIncorrect(boolean(), 10, "a number is not a boolean");
}

{
  // nullable
  assertValidator(
    nullable(string()),
    "",
    "A non-null nullable string should be valid"
  );
  assertValidator(
    nullable(string()),
    null,
    "A null nullable string should be valid"
  );
  assertValidator(
    nullable(number()),
    10,
    "A non-null nullable number should be valid"
  );
  assertIncorrect(nullable(string()), 10, "A number is never valid");
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
    object({ sweet: optional(exact("cool")) }),
    {} as any,
    "An empty object is a valid object where the only field is optional"
  );
  assertValidator(
    object({}),
    { sweet: "cool" },
    "An object with fields is a valid empty object"
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
    alternatives(number(), string()),
    42,
    "A number is either a valid string or a number"
  );
  assertValidator(
    alternatives(number(), string()),
    24,
    "A number is a valid string or a number"
  );
  assertValidator(
    alternatives(number(), string()),
    "a",
    "A string is a valid string or a number"
  );
  assertValidator(
    alternatives(number(), string()),
    "b",
    "A string is a valid string or a number"
  );
  assertIncorrect(
    alternatives(number(), string()),
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
    arrayOf(alternatives(number(), string())),
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
    arrayOf(alternatives(number(), boolean())),
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
    objectOf(alternatives(number(), string())),
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
}
