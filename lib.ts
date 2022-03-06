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

/**
 * An object that serves as a validator.
 */
export type Validator<T> = {
  __: T;
  validate: (value: any) => ValidationResult<T>;
};

/**
 * An object that represents the result of a validation check.
 */
export type ValidationResult<T> =
  | { isValid: false; error: IValidationError }
  | { value: T; isValid: true };

/**
 * An object that represents a validation error.
 */
export type IValidationError = {
  readonly type: string;
  readonly errorMessage: string;
  readonly value: any;
} & { [key: string]: any };

/**
 * A base abstract class that represents a generic validation error.
 */
export abstract class ValidationError
  extends Error
  implements IValidationError
{
  /**
   * Represents the call stack of the validation.
   */
  public fullStack?: string;

  /**
   *
   * @param type A string representing what type of validation error that the
   *   error represents
   * @param errorMessage Some detail regarding the nature of the error
   * @param value The original value that triggered the validation error
   */
  constructor(
    public type: string,
    public errorMessage: string,
    public value: any
  ) {
    super(errorMessage);

    this.fullStack = this.stack;
  }
}

export class EitherError extends ValidationError {
  constructor(value: any, public validationResults: ValidationResult<any>[]) {
    super(
      "Either error",
      "The provided value does not match any of the possible validators",
      value
    );
  }
}

export class TupleError<T> extends ValidationError {
  constructor(value: any[], public validationResults: ValidationResult<T>[]) {
    super(
      "Tuple error",
      `The supplied tuple had ${validationResults.filter(
        (validation) => !validation.isValid
      )} issues`,
      value
    );
  }
}

export class NotAnArrayError extends ValidationError {
  constructor(value: any) {
    super(
      "Not an array error",
      "Expected an array, but instead got something else",
      value
    );
  }
}

export class UnexpectedArrayLengthError extends ValidationError {
  constructor(value: any[], public expectedLength: number) {
    super(
      "Unexpected array length error",
      `Expected an array of length ${expectedLength} but instead got ${value.length}`,
      value
    );
  }
}

/**
 * A helper type for converting a Validator<T> type to a T
 *
 * For example, if you wanted to grab the validator from a `string()`, you'd use
 * this type like so:
 *
 * ```typescript
 * const stringValidator = string();
 *
 * type Str = InferType<typeof stringValidator>;
 * // Should be `type Str = string`
 * ```
 *
 * You can do this with objects as well. For example:
 *
 * ```typescript
 * const objectValidator = object({
 *   name: string(),
 *   email: string(),
 *   age: number()
 * });
 *
 * type Obj = InferType<typeof objectValidator>;
 * // Should be:
 * //
 * // type Obj = {
 * //   name: string
 * //   email: string
 * //   age: number
 * // }
 * ```
 */
export type InferType<T extends Validator<any>> = T["__"];

export function either<T0, T1>(
  a0: Validator<T0>,
  a1: Validator<T1>
): Validator<T0 | T1>;
export function either<T0, T1, T2>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>
): Validator<T0 | T1 | T2>;
export function either<T0, T1, T2, T3>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>
): Validator<T0 | T1 | T2 | T3>;
export function either<T0, T1, T2, T3, T4>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>
): Validator<T0 | T1 | T2 | T3 | T4>;
export function either<T0, T1, T2, T3, T4, T5>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>
): Validator<T0 | T1 | T2 | T3 | T4 | T5>;
export function either<T0, T1, T2, T3, T4, T5, T6>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6>;
export function either<T0, T1, T2, T3, T4, T5, T6, T7>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7>;
export function either<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
export function either<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export function either<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;
export function either<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11>;
export function either<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>
): Validator<
  T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 | T13
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>
): Validator<
  T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 | T13 | T14
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>,
  a18: Validator<T18>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
  | T18
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>,
  a18: Validator<T18>,
  a19: Validator<T19>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
  | T18
  | T19
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>,
  a18: Validator<T18>,
  a19: Validator<T19>,
  a20: Validator<T20>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
  | T18
  | T19
  | T20
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20,
  T21
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>,
  a18: Validator<T18>,
  a19: Validator<T19>,
  a20: Validator<T20>,
  a21: Validator<T21>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
  | T18
  | T19
  | T20
  | T21
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20,
  T21,
  T22
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>,
  a18: Validator<T18>,
  a19: Validator<T19>,
  a20: Validator<T20>,
  a21: Validator<T21>,
  a22: Validator<T22>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
  | T18
  | T19
  | T20
  | T21
  | T22
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20,
  T21,
  T22,
  T23
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>,
  a18: Validator<T18>,
  a19: Validator<T19>,
  a20: Validator<T20>,
  a21: Validator<T21>,
  a22: Validator<T22>,
  a23: Validator<T23>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
  | T18
  | T19
  | T20
  | T21
  | T22
  | T23
>;
export function either<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20,
  T21,
  T22,
  T23,
  T24
>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>,
  a8: Validator<T8>,
  a9: Validator<T9>,
  a10: Validator<T10>,
  a11: Validator<T11>,
  a12: Validator<T12>,
  a13: Validator<T13>,
  a14: Validator<T14>,
  a15: Validator<T15>,
  a16: Validator<T16>,
  a17: Validator<T17>,
  a18: Validator<T18>,
  a19: Validator<T19>,
  a20: Validator<T20>,
  a21: Validator<T21>,
  a22: Validator<T22>,
  a23: Validator<T23>,
  a24: Validator<T24>
): Validator<
  | T0
  | T1
  | T2
  | T3
  | T4
  | T5
  | T6
  | T7
  | T8
  | T9
  | T10
  | T11
  | T12
  | T13
  | T14
  | T15
  | T16
  | T17
  | T18
  | T19
  | T20
  | T21
  | T22
  | T23
  | T24
>;

/**
 * A validator for validating objects against a list of validators.
 *
 * This is especially useful if a possible object has more than one possible
 * valid type.
 *
 * ## Usage
 *
 * ```typescript
 * const alts = alternatives(string(), number());
 *
 * const num = 10;
 * const str = "hello";
 * const bool = true;
 *
 * console.log(alts.validate(num).valid); // Should be true
 * console.log(alts.validate(str).valid); // Should be true
 * console.log(alts.validate(bool).valid); // Should be false
 * ```
 * @param alts A list of validators that are to be run
 * @returns A validator to validate an object against a set of validators
 */
export function either<T>(...alts: Validator<T>[]): Validator<T> {
  return {
    __: {} as any,
    validate: (value: any) => {
      const validations = alts.map((validator) => validator.validate(value));
      return validations.some((validation) => validation.isValid)
        ? { isValid: true, value, __: value }
        : {
            isValid: false,
            __: value,
            error: new EitherError(value, validations),
          };
    },
  };
}
export function tuple(t: []): Validator<[]>;
export function tuple<T0>(t: [Validator<T0>]): Validator<[T0]>;
export function tuple<T0, T1>(
  t: [Validator<T0>, Validator<T1>]
): Validator<[T0, T1]>;
export function tuple<T0, T1, T2>(
  t: [Validator<T0>, Validator<T1>, Validator<T2>]
): Validator<[T0, T1, T2]>;
export function tuple<T0, T1, T2, T3>(
  t: [Validator<T0>, Validator<T1>, Validator<T2>, Validator<T3>]
): Validator<[T0, T1, T2, T3]>;
export function tuple<T0, T1, T2, T3, T4>(
  t: [Validator<T0>, Validator<T1>, Validator<T2>, Validator<T3>, Validator<T4>]
): Validator<[T0, T1, T2, T3, T4]>;
export function tuple<T0, T1, T2, T3, T4, T5>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>
  ]
): Validator<[T0, T1, T2, T3, T4, T5]>;
export function tuple<T0, T1, T2, T3, T4, T5, T6>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6]>;
export function tuple<T0, T1, T2, T3, T4, T5, T6, T7>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7]>;
export function tuple<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7, T8]>;
export function tuple<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function tuple<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
export function tuple<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11]>;
export function tuple<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12]>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13]>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>
  ]
): Validator<[T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14]>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>
  ]
): Validator<
  [T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>
  ]
): Validator<
  [T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>,
    Validator<T17>
  ]
): Validator<
  [
    T0,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    T11,
    T12,
    T13,
    T14,
    T15,
    T16,
    T17
  ]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>,
    Validator<T17>,
    Validator<T18>
  ]
): Validator<
  [
    T0,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    T11,
    T12,
    T13,
    T14,
    T15,
    T16,
    T17,
    T18
  ]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>,
    Validator<T17>,
    Validator<T18>,
    Validator<T19>
  ]
): Validator<
  [
    T0,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    T11,
    T12,
    T13,
    T14,
    T15,
    T16,
    T17,
    T18,
    T19
  ]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>,
    Validator<T17>,
    Validator<T18>,
    Validator<T19>,
    Validator<T20>
  ]
): Validator<
  [
    T0,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    T11,
    T12,
    T13,
    T14,
    T15,
    T16,
    T17,
    T18,
    T19,
    T20
  ]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20,
  T21
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>,
    Validator<T17>,
    Validator<T18>,
    Validator<T19>,
    Validator<T20>,
    Validator<T21>
  ]
): Validator<
  [
    T0,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    T11,
    T12,
    T13,
    T14,
    T15,
    T16,
    T17,
    T18,
    T19,
    T20,
    T21
  ]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20,
  T21,
  T22
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>,
    Validator<T17>,
    Validator<T18>,
    Validator<T19>,
    Validator<T20>,
    Validator<T21>,
    Validator<T22>
  ]
): Validator<
  [
    T0,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    T11,
    T12,
    T13,
    T14,
    T15,
    T16,
    T17,
    T18,
    T19,
    T20,
    T21,
    T22
  ]
>;
export function tuple<
  T0,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
  T14,
  T15,
  T16,
  T17,
  T18,
  T19,
  T20,
  T21,
  T22,
  T23
>(
  t: [
    Validator<T0>,
    Validator<T1>,
    Validator<T2>,
    Validator<T3>,
    Validator<T4>,
    Validator<T5>,
    Validator<T6>,
    Validator<T7>,
    Validator<T8>,
    Validator<T9>,
    Validator<T10>,
    Validator<T11>,
    Validator<T12>,
    Validator<T13>,
    Validator<T14>,
    Validator<T15>,
    Validator<T16>,
    Validator<T17>,
    Validator<T18>,
    Validator<T19>,
    Validator<T20>,
    Validator<T21>,
    Validator<T22>,
    Validator<T23>
  ]
): Validator<
  [
    T0,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    T11,
    T12,
    T13,
    T14,
    T15,
    T16,
    T17,
    T18,
    T19,
    T20,
    T21,
    T22,
    T23
  ]
>;

/**
 * Used to validate a tuple against the individual values in an array.
 *
 * ## Usage
 *
 * ```typescript
 * const tup = tuple(string(), number());
 *
 * alts.validate(["a", 1]).isValid // will be true
 * alts.validate([1, "a"]).isValid // will be false
 * alts.validate([1]).isValid // will be false
 * ```
 * @param t The tuple of validators to validate a tuple against
 * @returns A validator to validate tuples
 */
export function tuple(t: Validator<any>[]): Validator<any[]> {
  return {
    __: {} as any,
    validate: (value: any) => {
      if (!Array.isArray(value)) {
        return {
          isValid: false,
          error: new NotAnArrayError(value),
        };
      }
      if (t.length !== value.length) {
        return {
          isValid: false,
          error: new UnexpectedArrayLengthError(value, t.length),
        };
      }
      const validations = t.map((validator, i) => validator.validate(value[i]));
      return validations.every((validation) => validation.isValid)
        ? { isValid: true, value }
        : {
            isValid: false,
            error: new TupleError(
              value,
              validations.filter((validation) => !validation.isValid)
            ),
          };
    },
  };
}

export class UnexpectedValueError extends ValidationError {
  constructor(value: any) {
    super("Unexpected value error", "The supplied value is not allowed", value);
  }
}

/**
 * Creates a validator for an object that rejects all values that passes the
 * invalidator.
 *
 * This validator is especially useful for cases where a value can be a string,
 * except for specific strings.
 *
 * For example:
 *
 * ```
 *const everythingButValidator = except(string(), exact("but"));
 *
 * everythingButValidator.validate("apples").isValid; // ✅
 * everythingButValidator.validate("bananas").isValid; // ✅
 * everythingButValidator.validate("cherries").isValid; // ✅
 * everythingButValidator.validate("but").isValid; // ❌
 * ```
 * @param validator The validator for which to validate the value against
 * @param invalidator The validator for which if is valid, the value will be
 *   rejected
 * @returns A Validator that will reject all values for which the invalidator
 *   validates the object
 */
export function except<T, I>(
  validator: Validator<T>,
  invalidator: Validator<I>
): Validator<Exclude<T, I>> {
  return {
    __: {} as Exclude<T, I>,
    validate: (value: any) => {
      const validation = validator.validate(value);
      if (validation.isValid === false) {
        return { isValid: false, error: validation.error };
      }
      return validator.validate(value).isValid &&
        !invalidator.validate(value).isValid
        ? { isValid: true, value }
        : { isValid: false, error: new UnexpectedValueError(value) };
    },
  };
}

function _v(v: any) {
  return typeof v;
}

const _s = _v({} as any);

export class UnexpectedTypeofValue extends ValidationError {
  constructor(value: any, public expectedType: typeof _s) {
    super(
      "Unexpected typeof",
      `Expected a value of type ${expectedType}, but got something else`,
      value
    );
  }
}

/**
 * Creates a validator that determines if the supplied value is a string.
 * @returns A validator to check if the value is of type string
 */
export const string = (): Validator<string> => {
  return {
    __: "",
    validate: (value: any) =>
      typeof value !== "string"
        ? { isValid: false, error: new UnexpectedTypeofValue(value, "string") }
        : { value, isValid: true },
  };
};

export type ExactTypes = string | number | boolean | null | undefined;

class NotExactValueError extends ValidationError {
  constructor(value: any, public expectedValue: ExactTypes) {
    super(
      "Incorrect value",
      `Expected the value to equal exactly ${expectedValue} but instead got something else`,
      value
    );
  }
}

/**
 * Creates a validator that validates values that match the expected value
 * exactly.
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
export function exact<V extends ExactTypes>(expected: V): Validator<V> {
  return {
    __: {} as any,
    validate: (value: any) =>
      value !== expected
        ? { isValid: false, error: new NotExactValueError(value, expected) }
        : { value, isValid: true },
  };
}

/**
 * Creates a validator that determines if the supplied value is a number.
 * @returns A validator to check if the value is of type number
 */
export const number = (): Validator<number> => ({
  __: 0,
  validate: (value: any) =>
    typeof value !== "number"
      ? { isValid: false, error: new UnexpectedTypeofValue(value, "number") }
      : { value, isValid: true },
});

/**
 * Creates a validator that determines if the supplied value is a boolean.
 * @returns A validator to check if the value is of type boolean
 */
export const boolean = (): Validator<boolean> => ({
  __: false,
  validate: (value: any) =>
    typeof value !== "boolean"
      ? { isValid: false, error: new UnexpectedTypeofValue(value, "boolean") }
      : { value, isValid: true },
});

type BadValue<T> = { index: number; validation: ValidationResult<T> };

export class ArrayOfInvalidValuesError<T> extends ValidationError {
  public badValues: BadValue<T>[];

  constructor(value: T[], errors: BadValue<T>[]) {
    super(
      "Array of invalid values",
      `${errors.length} of the ${value.length} are invalid`,
      value
    );
    this.badValues = errors;
  }
}

/**
 * Creates a validator that determines if the supplied value is an array of the
 * specified validator.
 * @param validator The validator to validate the individual array values
 *   against
 * @returns A validator to check if the value is an array of the specified
 *   validator
 */
export function arrayOf<V>(validator: Validator<V>): Validator<V[]> {
  return {
    __: [],
    validate: (value: any) => {
      if (!Array.isArray(value)) {
        return { isValid: false, error: new NotAnArrayError(value) };
      }
      const validations = value.map((v) => validator.validate(v));
      return validations.every(({ isValid }) => isValid)
        ? { value, isValid: true }
        : {
            isValid: false,
            error: new ArrayOfInvalidValuesError(
              value,
              validations
                .map((v, i) => ({ index: i, validation: v }))
                .filter(({ validation }) => !validation.isValid)
            ),
          };
    },
  };
}

export class BadObjectError extends ValidationError {
  constructor(
    value: any,
    public faultyFields: { [key: string]: ValidationError }
  ) {
    super(
      "Bad object",
      "The supplied object had fields that failed to validate",
      value
    );
  }
}

function mergeObjects(objects: { [key: string]: any }[]) {
  const result: { [key: string]: any } = {};
  for (const object of objects) {
    for (const [key, value] of Object.entries(object)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Creates a validator that determines if the supplied value is an object, whose
 * fields contains are of nothing but types as defined by the specified
 * validator.
 * @param validator The validator to validate the individual fields in the
 *   object
 * @returns A validator that determines if the supplied value is an object,
 *   whose fields contains are of nothing but types as defined by the specified
 *   validator.
 */
export function objectOf<V>(
  validator: Validator<V>
): Validator<{ [keys: string]: V }> {
  return {
    __: {},
    validate: (value: any) => {
      if (value === undefined) {
        return { isValid: false, error: new ValueIsUndefinedError() };
      }
      if (value === null) {
        return { isValid: false, error: new ValueIsNullError() };
      }
      if (typeof value !== "object") {
        return {
          isValid: false,
          error: new UnexpectedTypeofValue(value, "object"),
        };
      }

      const fields = Object.keys(value).map((key) => ({
        key,
        validation: validator.validate(value[key]),
      }));

      return fields.every(({ validation }) => validation.isValid)
        ? { value, isValid: true }
        : {
            isValid: false,
            error: new BadObjectError(
              value,
              mergeObjects(
                fields
                  .filter(({ validation }) => !validation.isValid)
                  .map(({ key, validation }) => ({ [key]: validation }))
              )
            ),
          };
    },
  };
}

function validValidator<V>(
  value: any
): { valid: false } | { valid: true; validator: Validator<V> } {
  return value && typeof value.validate === "function"
    ? { valid: true, validator: value }
    : { valid: false };
}

export class ValueIsUndefinedError extends ValidationError {
  constructor() {
    super(
      "Value is undefined",
      "The supplied value is undefined, when it should have been something else",
      undefined
    );
  }
}

export class ValueIsNullError extends ValidationError {
  constructor() {
    super(
      "Value is null",
      "The supplied value is null, when it should have been something else",
      null
    );
  }
}

/**
 * Creates a validator for an object, specified by the "schema".
 *
 * Each field in the "schema" is a validator, and each of them will validate
 * values against objects in concern.
 * @param schema An object containing fields of nothing but validators, each of
 *   which will be used to validate the value's respective fields
 * @returns A validator that will validate an object against the `schema`
 */
export function object<V extends object>(schema: {
  [key in keyof V]: Validator<V[key]>;
}): Validator<V> {
  return {
    __: {} as V,
    validate: (value: any) => {
      if (value === undefined) {
        return { isValid: false, error: new ValueIsUndefinedError() };
      }
      if (value === null) {
        return { isValid: false, error: new ValueIsNullError() };
      }
      if (typeof value !== "object") {
        return {
          isValid: false,
          error: new UnexpectedTypeofValue(value, "object"),
        };
      }

      const fields = Object.keys(schema).map((key) => ({
        key,
        validation: ((schema as any)[key] as Validator<any>).validate(
          value[key]
        ),
      }));

      return fields.every(({ validation }) => validation.isValid)
        ? { value, isValid: true }
        : {
            isValid: false,
            error: new BadObjectError(
              value,
              mergeObjects(
                fields
                  .filter(({ validation }) => !validation.isValid)
                  .map(({ key, validation }) => ({ [key]: validation }))
              )
            ),
          };
    },
  };
}

/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
 * @returns A validator that will validate *all* objects
 */
export function any(): Validator<any> {
  return {
    __: "",
    validate: (value: any) => ({ isValid: true, value }),
  };
}

/**
 * Creates a validator that lazily evaluates the callback, at every validation.
 *
 * Useful for recursive types, such as a node for a tree.
 * @param schemaFn A function that returns a validator
 * @returns A validator, effectively just a "forwarding" of the validator
 *   returned by the `schemaFn`
 */
export function lazy<V extends any>(
  schemaFn: () => Validator<V>
): Validator<V> {
  return {
    __: {} as V,
    validate: (value: any) => schemaFn().validate(value),
  };
}
