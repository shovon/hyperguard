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
  tuple,
  InferType,
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

{
  const assertExact = <T>(v: Validator<T>, value: T) => {
    const validation = v.validate(value);
    assert(validation.valid);
    assert(validation.value === value);
  };
  const assertIncorrect = <T>(v: Validator<T>, value: any) => {
    const validation = v.validate(value);
    assert(!validation.valid);
  };
  assertExact(exact("hello"), "hello");
  assertIncorrect(exact("hello"), "hah");
  assertExact(exact(10), 10);
  assertIncorrect(exact(10), 2);
  assertExact(exact(undefined), undefined);
  assertIncorrect(exact(undefined), null);
  assertExact(exact(null), null);
  assertIncorrect(exact(null), undefined);
  assertExact(exact(false), false);
  assertIncorrect(exact(false), true);
  assertExact(exact(true), true);
  assertIncorrect(exact(true), false);
}

{
  const assertString = (v: Validator<string>, value: any) => {
    const validation = v.validate(value);
    assert(validation.valid);
    assert(validation.value === value);
  };
  const assertIncorrect = (v: Validator<string>, value: any) => {
    const validation = v.validate(value);
    assert(!validation.valid);
  };

  assertString(string(), "haha");
  assertString(string(), "sweet");
  assertIncorrect(string(), 10);
}

{
  const assertNullable = <T>(v: Validator<T | null>, value: any) => {
    const validation = v.validate(value);
    assert(validation.valid);
    assert(validation.value === value);
  };
  const assertIncorrect = <T>(v: Validator<T | null>, value: any) => {
    const validation = v.validate(value);
    assert(!validation.valid);
  };

  assertNullable(nullable(string()), "");
  assertNullable(nullable(string()), null);
  assertIncorrect(nullable(string()), 10);
}

{
  const assertOptional = <T>(v: Validator<T | undefined>, value: any) => {
    const validation = v.validate(value);
    assert(validation.valid);
    assert(validation.value === value);
  };
  const assertIncorrect = <T>(v: Validator<T | undefined>, value: any) => {
    const validation = v.validate(value);
    assert(!validation.valid);
  };

  assertOptional(optional(string()), "");
  assertOptional(optional(string()), undefined);
  assertIncorrect(optional(string()), 10);
}

{
  const assertNumber = (v: Validator<number>, value: any) => {
    const validation = v.validate(value);
    assert(validation.valid);
    assert(validation.value === value);
  };
  const assertIncorrect = (v: Validator<number>, value: any) => {
    const validation = v.validate(value);
    assert(!validation.valid);
  };

  assertNumber(number(), 42);
  assertNumber(number(), 24);
  assertIncorrect(number(), "Sweet");
}

{
  const assertArrayOf = (v: Validator<number[]>, value: any) => {
    const validation = v.validate(value);
    assert(validation.valid);
    assert(validation.value === value);
  };
  const assertIncorrect = (v: Validator<number[]>, value: any) => {
    const validation = v.validate(value);
    assert(!validation.valid);
  };

  assertArrayOf(arrayOf(number()), [42]);
  assertArrayOf(arrayOf(number()), [24, 24]);
  assertArrayOf(arrayOf(number()), [24, 2]);
  assertIncorrect(arrayOf(number()), 2);
  assertIncorrect(arrayOf(number()), "nice");
  assertIncorrect(arrayOf(number()), ["nice"]);
}

{
  const assertAlternatives = () => {};
}
