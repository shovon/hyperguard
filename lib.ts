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

export type ValidationResult<T> = { valid: false } | { value: T; valid: true };

export type Validator<T> = {
  __outputType: T;
  validate: (value: any) => ValidationResult<T>;
};

export type InferType<T extends Validator<any>> = T["__outputType"];

export function alternatives<T0, T1>(
  a0: Validator<T0>,
  a1: Validator<T1>
): Validator<T0 | T1>;
export function alternatives<T0, T1, T2>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>
): Validator<T0 | T1 | T2>;
export function alternatives<T0, T1, T2, T3>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>
): Validator<T0 | T1 | T2 | T3>;
export function alternatives<T0, T1, T2, T3, T4>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>
): Validator<T0 | T1 | T2 | T3 | T4>;
export function alternatives<T0, T1, T2, T3, T4, T5>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>
): Validator<T0 | T1 | T2 | T3 | T4 | T5>;
export function alternatives<T0, T1, T2, T3, T4, T5, T6>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6>;
export function alternatives<T0, T1, T2, T3, T4, T5, T6, T7>(
  a0: Validator<T0>,
  a1: Validator<T1>,
  a2: Validator<T2>,
  a3: Validator<T3>,
  a4: Validator<T4>,
  a5: Validator<T5>,
  a6: Validator<T6>,
  a7: Validator<T7>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7>;
export function alternatives<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
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
export function alternatives<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
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
export function alternatives<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
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
export function alternatives<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
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
export function alternatives<
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
  T12
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
  a12: Validator<T12>
): Validator<T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12>;
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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
export function alternatives<
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

export function alternatives(...alts: Validator<any>[]): Validator<any> {
  return {
    __outputType: {} as any,
    validate: (value: any) =>
      alts.some((validator) => validator.validate(value).valid)
        ? { valid: true, value, __outputType: value }
        : { valid: false, __outputType: value },
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

export function tuple(t: Validator<any>[]): Validator<any[]> {
  return {
    __outputType: {} as any,
    validate: (value: any) =>
      Array.isArray(value) &&
      t.length === value.length &&
      t.every((validator, i) => validator.validate(value[i]))
        ? { valid: true, value }
        : { valid: false },
  };
}

export const string = (
  predicate: (value: string) => boolean = () => true
): Validator<string> => {
  const validate: (value: any) => ValidationResult<string> = (value: any) =>
    typeof value !== "string" || !predicate(value)
      ? { valid: false }
      : { value, valid: true };
  return {
    __outputType: "",
    validate,
  };
};

export function exact<V extends string | number | boolean | null | undefined>(
  expected: V
): Validator<V> {
  return {
    __outputType: {} as any,
    validate: (value: any) =>
      value !== expected ? { valid: false } : { value, valid: true },
  };
}

export function nullable<V>(validator: Validator<V>): Validator<V | null> {
  return {
    __outputType: null,
    validate: (value: any) =>
      validator.validate(value).valid || value === null
        ? { valid: true, value }
        : { valid: false },
  };
}

export function optional<V>(validator: Validator<V>): Validator<V | undefined> {
  return {
    __outputType: undefined,
    validate: (value: any) =>
      validator.validate(value).valid || value === undefined
        ? { valid: true, value }
        : { valid: false },
  };
}

export const number = (
  predicate: (value: number) => boolean = () => true
): Validator<number> => ({
  __outputType: 0,
  validate: (value: any) =>
    typeof value !== "number" || !predicate(value)
      ? { valid: false }
      : { value, valid: true },
});

export const boolean = (): Validator<boolean> => ({
  __outputType: false,
  validate: (value: any) =>
    typeof value !== "boolean" ? { valid: false } : { value, valid: true },
});

export function arrayOf<V>(
  validator: Validator<V>,
  predicate: (value: V, index: number) => boolean = () => true
): Validator<V[]> {
  return {
    __outputType: [],
    validate: (value: any) =>
      Array.isArray(value) &&
      value.every(
        (value, i) => validator.validate(value).valid && predicate(value, i)
      )
        ? { value, valid: true }
        : { valid: false },
  };
}

export function objectOf<V>(
  validator: Validator<V>,
  predicate: (value: V, key: string) => boolean = () => true
): Validator<{ [keys: string]: V }> {
  return {
    __outputType: {},
    validate: (value: any) =>
      !!value &&
      typeof value === "object" &&
      Object.keys(value).every(
        (key) => validator.validate(value[key]).valid && predicate(value, key)
      )
        ? { value, valid: true }
        : { valid: false },
  };
}

function validValidator<V>(
  value: any
): { valid: false } | { valid: true; validator: Validator<V> } {
  return value && typeof value.validator === "function"
    ? { valid: true, validator: value }
    : { valid: false };
}

export function object<V extends object>(schema: {
  [key in keyof V]: Validator<V[key]>;
}): Validator<V> {
  return {
    __outputType: {} as V,
    validate: (value: any) =>
      !!value &&
      typeof value === "object" &&
      Object.keys(value).every((key) => {
        const validation = validValidator((schema as any)[key]);
        if (validation.valid) {
          return validation.validator.validate(value[key]).valid;
        } else {
          throw new Error("Something went wrong");
        }
      })
        ? { valid: false, __outputType: value }
        : { value, valid: true, __outputType: value },
  };
}

export function any(): Validator<any> {
  return {
    __outputType: "",
    validate: (value: any) => ({ valid: true, value }),
  };
}

export function recursiveObject<V extends object>(
  schemaFn: () => {
    [key in keyof V]: Validator<V[key]>;
  }
): Validator<V> {
  return {
    __outputType: {} as V,
    validate: (value: any) =>
      !!value &&
      typeof value === "object" &&
      Object.keys(value).every((key) => {
        const schema = schemaFn();
        const validation = validValidator((schema as any)[key]);
        if (validation.valid) {
          return validation.validator.validate(value[key]).valid;
        } else {
          throw new Error("Something went wrong");
        }
      })
        ? { valid: false, __outputType: value }
        : { value, valid: true, __outputType: value },
  };
}
