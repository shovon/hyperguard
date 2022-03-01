/*
Copyright 2022 Salehen Shovon Rahman

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
} from "./lib";
import { strict as assert } from "assert";

function isEmail() {
  return true;
}

function isUrl() {
  return true;
}

function isDate() {
  return true;
}

let userSchema = object({
  name: string(),
  age: number((n) => n >= 0 && Number.isInteger(n)),
  email: optional(string(isEmail)),
  website: optional(nullable(string(isUrl))),
  createdOn: string(isDate),
});

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

  assertArrayOf(arrayOf(), 42);
  assertArrayOf(number(), 24);
  assertIncorrect(number(), "Sweet");
}
