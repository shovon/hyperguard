/*
Copyright 2026 Salehen Shovon Rahman

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
  validate: (value: unknown) => ValidationResult<T>;
};

/**
 * The result of a failed validation, carrying the validation error.
 */
export type ValidationFailure = { isValid: false; error: IValidationError };
/**
 * The result of a successful validation, carrying the validated value.
 */
export type ValidationSuccess<T> = { value: T; isValid: true };

/**
 * An object that represents the result of a validation check.
 */
export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

/**
 * An object that represents a validation error.
 */
export type IValidationError = {
  readonly type: string;
  readonly errorMessage: string;
  readonly value: unknown;
};

/**
 * A base abstract class that represents a generic validation error.
 */
export abstract class ValidationError
  extends Error
  implements IValidationError
{
  public type: string;
  public errorMessage: string;
  public value: unknown;

  /**
   *
   * @param type A string representing what type of validation error that the
   *   error represents
   * @param errorMessage Some detail regarding the nature of the error
   * @param value The original value that triggered the validation error
   */
  constructor(type: string, errorMessage: string, value: unknown) {
    super(errorMessage);
    this.type = type;
    this.errorMessage = errorMessage;
    this.value = value;
  }
}

/**
 * Produces a short, human-readable description of an arbitrary value, suitable
 * for embedding in an error message. Strings are quoted (so `"10"` is
 * distinguishable from `10`), objects and functions are described by kind
 * rather than dumped in full, and everything else is stringified.
 */
const describeValue = (value: unknown): string => {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "bigint":
      return `${value}n`;
    case "function":
      return "a function";
    case "symbol":
      return value.toString();
    case "object": {
      if (value === null) return "null";
      return Array.isArray(value) ? "an array" : "an object";
    }
    default:
      // number, boolean, undefined
      return String(value);
  }
};

/**
 * A validation error raised when a value fails to match any of the validators
 * supplied to {@link either}.
 */
export class EitherError extends ValidationError {
  public validationResults: ValidationResult<unknown>[];

  constructor(value: unknown, validationResults: ValidationResult<unknown>[]) {
    super(
      "Either error",
      "The provided value does not match any of the possible validators",
      value,
    );
    this.validationResults = validationResults;
  }
}

/**
 * A validation error raised when one or more elements of a tuple fail to
 * validate against their respective validators in {@link tuple}.
 */
export class TupleError<T> extends ValidationError {
  public validationResults: ValidationResult<T>[];

  constructor(value: unknown[], validationResults: ValidationResult<T>[]) {
    super(
      "Tuple error",
      `The supplied tuple had ${
        validationResults.filter((validation) => !validation.isValid).length
      } issues`,
      value,
    );
    this.validationResults = validationResults;
  }
}

/**
 * A validation error raised when a value was expected to be an array but was
 * something else.
 */
export class NotAnArrayError extends ValidationError {
  constructor(value: unknown) {
    super(
      "Not an array error",
      "Expected an array, but instead got something else",
      value,
    );
  }
}

/**
 * A validation error raised when an array's length does not match the length
 * expected by the validator (e.g. a {@link tuple}).
 */
export class UnexpectedArrayLengthError extends ValidationError {
  public expectedLength: number;

  constructor(value: unknown[], expectedLength: number) {
    super(
      "Unexpected array length error",
      `Expected an array of length ${expectedLength} but instead got ${value.length}`,
      value,
    );
    this.expectedLength = expectedLength;
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
export type InferType<V extends Validator<unknown>> =
  V extends Validator<infer T> ? T : never;

type ValidatorArrayToValidatorUnion<T extends Validator<unknown>[]> =
  T extends Validator<infer I>[] ? Validator<I> : never;

const first = <T>(arr: T[]): T => {
  if (arr.length <= 0) throw new Error("Array is empty");
  return arr[0];
};

/**
 * A validator for validating objects against a list of validators.
 *
 * This is especially useful if a possible object has more than one possible
 * valid type.
 *
 * ## Usage
 *
 * ```typescript
 * const stringOrNumber = either(string(), number());
 *
 * stringOrNumber.validate(10).isValid;      // ✅ true
 * stringOrNumber.validate("hello").isValid; // ✅ true
 * stringOrNumber.validate(true).isValid;    // ❌ false
 * ```
 * @param alts A list of validators that are to be run
 * @returns A validator to validate an object against a set of validators
 */
export function either<T extends Validator<unknown>[]>(
  ...alts: T
): ValidatorArrayToValidatorUnion<T> {
  return {
    validate: (value: unknown) => {
      const validations = alts.map((validator) => validator.validate(value));
      return validations.some((validation) => validation.isValid)
        ? {
            isValid: true,
            value: first(validations.filter((v) => v.isValid)).value,
          }
        : {
            isValid: false,
            error: new EitherError(value, validations),
          };
    },
  } as ValidatorArrayToValidatorUnion<T>;
}

/**
 * A validation error raised when a value validates against the excluded
 * validator in {@link exclude}, meaning it includes a value it shouldn't.
 */
export class ExcludedIncludedError<U> extends ValidationError {
  public validationResults: ValidationResult<U>;
  constructor(value: unknown, validationResults: ValidationResult<U>) {
    super(
      "Exclude error",
      "The value matched the excluded validator, so it was rejected",
      value,
    );
    this.validationResults = validationResults;
  }
}

/**
 * A validator that validates if a value does not validate against another
 * validator.
 *
 * Similar to TypeScript's `Exclude` utility type.
 *
 * ## Usage
 *
 * ```typescript
 * const notAdmin = exclude(string(), exact("admin"));
 *
 * notAdmin.validate("hello").isValid; // ✅ true  (a string, not "admin")
 * notAdmin.validate("admin").isValid; // ❌ false (excluded value)
 * notAdmin.validate(42).isValid;      // ❌ false (not a string)
 * ```
 * @param a The validation to include
 * @param b The validation to exclude
 * @returns A validator where it validates if value validates with `a` but does
 *   not validate against `b`.
 */
export function exclude<V, T>(
  a: Validator<V>,
  b: Validator<T>,
): Validator<Exclude<V, T>> {
  return {
    validate: (value: unknown): ValidationResult<Exclude<V, T>> => {
      const aValidation = a.validate(value);
      const bValidation = b.validate(value);

      if (!aValidation.isValid) {
        return {
          isValid: false,
          error: aValidation.error,
        };
      }

      const isNotT = (val: unknown): val is Exclude<V, T> => {
        const bValidation = b.validate(val);
        return !bValidation.isValid;
      };

      if (isNotT(aValidation.value)) {
        return {
          isValid: true,
          value: aValidation.value,
        };
      }

      return {
        isValid: false,
        error: new ExcludedIncludedError(value, bValidation),
      };
    },
  };
}

type ValidatorTupleToValueTuple<T extends Validator<unknown>[]> = Validator<{
  [P in keyof T]: T[P] extends Validator<infer U> ? U : never;
}>;

/**
 * Used to validate a tuple against the individual values in an array.
 *
 * ## Usage
 *
 * ```typescript
 * const tup = tuple([string(), number()]);
 *
 * tup.validate(["a", 1]).isValid; // ✅ true
 * tup.validate([1, "a"]).isValid; // ❌ false (wrong order)
 * tup.validate([1]).isValid;      // ❌ false (wrong length)
 * ```
 * @param t The tuple of validators to validate a tuple against
 * @returns A validator to validate tuples
 */
export function tuple<T extends Validator<unknown>[]>(
  t: [...T],
): ValidatorTupleToValueTuple<T> {
  return {
    validate: (
      value: unknown,
    ): ValidationResult<InferType<ValidatorTupleToValueTuple<T>>> => {
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
      type InferedTupleType = InferType<ValidatorTupleToValueTuple<T>>;

      const validations = t.map((validator, i) => validator.validate(value[i]));

      const allValid = (
        results: typeof validations,
      ): results is ValidationSuccess<unknown>[] =>
        results.every((validation) => validation.isValid);

      if (!allValid(validations)) {
        return {
          isValid: false,
          error: new TupleError(
            value,
            validations.filter((validation) => !validation.isValid),
          ),
        };
      }

      // Return the validated (and possibly transformed) values rather than the
      // raw input, so per-element transforms are carried through. The `.map`
      // erases the positional tuple types, so we reassert the tuple shape here.
      return {
        isValid: true,
        value: validations.map(
          (validation) => validation.value,
        ) as InferedTupleType,
      };
    },
  };
}

/**
 * A validation error raised when a value matches a validator that was supposed
 * to reject it (e.g. the invalidator in {@link except}).
 */
export class UnexpectedValueError extends ValidationError {
  constructor(value: unknown) {
    super(
      "Unexpected value error",
      "The value matched the invalidator, so it was rejected",
      value,
    );
  }
}

/**
 * Creates a validator for an object that rejects all values that passes the
 * invalidator.
 *
 * This validator is especially useful for cases where a value can be a string,
 * except for specific strings.
 *
 * ## Usage
 *
 * ```typescript
 * const everythingBut = except(string(), exact("but"));
 *
 * everythingBut.validate("apples").isValid; // ✅ true
 * everythingBut.validate("cherries").isValid; // ✅ true
 * everythingBut.validate("but").isValid; // ❌ false (the excluded value)
 * everythingBut.validate(42).isValid; // ❌ false (not a string)
 * ```
 * @param validator The validator for which to validate the value against
 * @param invalidator The validator for which if is valid, the value will be
 *   rejected
 * @returns A Validator that will reject all values for which the invalidator
 *   validates the object
 */
export function except<T, I>(
  validator: Validator<T>,
  invalidator: Validator<I>,
): Validator<Exclude<T, I>> {
  return {
    validate: (value: unknown) => {
      const validation = validator.validate(value);
      if (validation.isValid === false) {
        return { isValid: false, error: validation.error };
      }
      return validation.isValid && !invalidator.validate(value).isValid
        ? { isValid: true, value: validation.value as Exclude<T, I> }
        : { isValid: false, error: new UnexpectedValueError(value) };
    },
  };
}

/**
 * The union of strings that the `typeof` operator can produce (e.g. `"string"`,
 * `"number"`, `"object"`).
 */
export type PossibleTypeof =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

/**
 * A validation error raised when the `typeof` a value does not match the
 * expected type.
 */
export class UnexpectedTypeofError extends ValidationError {
  public expectedType: PossibleTypeof;
  constructor(value: unknown, expectedType: PossibleTypeof) {
    super(
      "Unexpected typeof",
      `Expected a value of type ${expectedType}, but got ${typeof value}`,
      value,
    );
    this.expectedType = expectedType;
  }
}

/**
 * Creates a validator that determines if the supplied value is a string.
 *
 * ## Usage
 *
 * ```typescript
 * const str = string();
 *
 * str.validate("hello").isValid; // ✅ true
 * str.validate(42).isValid;      // ❌ false
 * ```
 * @returns A validator to check if the value is of type string
 */
export const string = (): Validator<string> => {
  return {
    validate: (value: unknown) =>
      typeof value !== "string"
        ? { isValid: false, error: new UnexpectedTypeofError(value, "string") }
        : { value, isValid: true },
  };
};

/**
 * The set of primitive values that {@link exact} can match against.
 */
export type ExactTypes = string | number | boolean | null | undefined;

class NotExactValueError extends ValidationError {
  public expectedValue: ExactTypes;

  constructor(value: unknown, expectedValue: ExactTypes) {
    super(
      "Incorrect value",
      `Expected the value to equal exactly ${describeValue(expectedValue)}, but got ${describeValue(value)}`,
      value,
    );
    this.expectedValue = expectedValue;
  }
}

/**
 * Creates a validator that validates values that match the expected value
 * exactly.
 *
 * ## Usage
 *
 * ```typescript
 * const yes = exact("yes");
 *
 * yes.validate("yes").isValid; // ✅ true
 * yes.validate("no").isValid;  // ❌ false
 * ```
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
export function exact<V extends ExactTypes>(expected: V): Validator<V> {
  return {
    validate: (value: unknown) => {
      const is = <V>(v: unknown, expected: V): v is V =>
        Object.is(value, expected);
      return is(value, expected)
        ? { value, isValid: true }
        : { isValid: false, error: new NotExactValueError(value, expected) };
    },
  };
}

/**
 * Creates a validator that determines if the supplied value is a number.
 *
 * ## Usage
 *
 * ```typescript
 * const num = number();
 *
 * num.validate(42).isValid;      // ✅ true
 * num.validate("42").isValid;    // ❌ false
 * ```
 * @returns A validator to check if the value is of type number
 */
export const number = (): Validator<number> => ({
  validate: (value: unknown) =>
    typeof value !== "number"
      ? { isValid: false, error: new UnexpectedTypeofError(value, "number") }
      : { value, isValid: true },
});

/**
 * Creates a validator that determines if the supplied value is a boolean.
 *
 * ## Usage
 *
 * ```typescript
 * const bool = boolean();
 *
 * bool.validate(true).isValid;  // ✅ true
 * bool.validate("true").isValid; // ❌ false
 * ```
 * @returns A validator to check if the value is of type boolean
 */
export const boolean = (): Validator<boolean> => ({
  validate: (value: unknown) =>
    typeof value !== "boolean"
      ? { isValid: false, error: new UnexpectedTypeofError(value, "boolean") }
      : { value, isValid: true },
});

/**
 * A validation error raised when a value is not an instance of the constructor
 * expected by {@link instance}.
 */
export class NotAnInstanceError<T> extends ValidationError {
  public expectedConstructor: abstract new (...args: never[]) => T;

  constructor(
    value: unknown,
    expectedConstructor: abstract new (...args: never[]) => T,
  ) {
    const got =
      value === null
        ? "null"
        : typeof value === "object"
          ? `an instance of ${value.constructor?.name ?? "an anonymous object"}`
          : typeof value;
    super(
      "Not an instance error",
      `Expected an instance of ${expectedConstructor.name}, but got ${got}`,
      value,
    );
    this.expectedConstructor = expectedConstructor;
  }
}

/**
 * Creates a validator that determines if the supplied value is an instance of
 * the given constructor (i.e. `value instanceof constructor`).
 *
 * ## Usage
 *
 * ```typescript
 * const dateValidator = instance(Date);
 *
 * dateValidator.validate(new Date()).isValid; // ✅
 * dateValidator.validate("2026-06-14").isValid; // ❌
 * ```
 * @param constructor The constructor to check the value against
 * @returns A validator that checks if the value is an instance of `constructor`
 */
export function instance<T>(
  constructor: abstract new (...args: never[]) => T,
): Validator<T> {
  return {
    validate: (value: unknown): ValidationResult<T> =>
      value instanceof constructor
        ? { isValid: true, value: value }
        : { isValid: false, error: new NotAnInstanceError(value, constructor) },
  };
}

type BadValue<T> = { index: number; validation: ValidationResult<T> };

/**
 * A validation error raised when one or more elements of an array fail to
 * validate in {@link arrayOf}, collecting each offending element and its index.
 */
export class ArrayOfInvalidValuesError<T> extends ValidationError {
  public badValues: BadValue<T>[];

  constructor(value: T[], errors: BadValue<T>[]) {
    super(
      "Array of invalid values",
      `${errors.length} of the ${value.length} elements failed to validate`,
      value,
    );
    this.badValues = errors;
  }
}

/**
 * Creates a validator that determines if the supplied value is an array of the
 * specified validator.
 *
 * ## Usage
 *
 * ```typescript
 * const numbers = arrayOf(number());
 *
 * numbers.validate([1, 2, 3]).isValid;   // ✅ true
 * numbers.validate([1, "2", 3]).isValid; // ❌ false (a non-number element)
 * numbers.validate("nope").isValid;      // ❌ false (not an array)
 * ```
 * @param validator The validator to validate the individual array values
 *   against
 * @returns A validator to check if the value is an array of the specified
 *   validator
 */
export function arrayOf<V>(validator: Validator<V>): Validator<V[]> {
  return {
    validate: (value: unknown) => {
      if (!Array.isArray(value)) {
        return { isValid: false, error: new NotAnArrayError(value) };
      }
      const validations = value.map((v) => validator.validate(v));
      return validations.every(
        (validation): validation is ValidationSuccess<V> => validation.isValid,
      )
        ? {
            value: validations.map((validation) => validation.value),
            isValid: true,
          }
        : {
            isValid: false,
            error: new ArrayOfInvalidValuesError(
              value,
              validations
                .map((v, i) => ({ index: i, validation: v }))
                .filter(({ validation }) => !validation.isValid),
            ),
          };
    },
  };
}

/**
 * A validation error raised when one or more fields of an object fail to
 * validate (in {@link object} or {@link objectOf}), keyed by field name.
 */
export class BadObjectError extends ValidationError {
  public faultyFields: { [key: string]: IValidationError };

  constructor(
    value: unknown,
    faultyFields: { [key: string]: IValidationError },
  ) {
    super(
      "Bad object",
      "The supplied object had fields that failed to validate",
      value,
    );
    this.faultyFields = faultyFields;
  }
}

function mergeObjects<V>(objects: Record<string, V>[]) {
  const result: { [key: string]: V } = {};
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
 *
 * ## Usage
 *
 * ```typescript
 * // An object used as a string-keyed map of numbers.
 * const scores = objectOf(number());
 *
 * scores.validate({ alice: 10, bob: 20 }).isValid; // ✅ true
 * scores.validate({ alice: 10, bob: "20" }).isValid; // ❌ false (a non-number field)
 * ```
 * @param validator The validator to validate the individual fields in the
 *   object
 * @returns A validator that determines if the supplied value is an object,
 *   whose fields contains are of nothing but types as defined by the specified
 *   validator.
 */
export function objectOf<V>(
  validator: Validator<V>,
): Validator<{ [keys: string]: V }> {
  return {
    validate: (value: unknown) => {
      if (value === undefined) {
        return { isValid: false, error: new ValueIsUndefinedError() };
      }
      if (typeof value !== "object") {
        return {
          isValid: false,
          error: new UnexpectedTypeofError(value, "object"),
        };
      }
      if (value === null) {
        return { isValid: false, error: new ValueIsNullError() };
      }

      if (!isRecord(value)) {
        return {
          isValid: false,
          error: new UnexpectedTypeofError(value, "object"),
        };
      }

      type FieldAndValidation<R extends ValidationResult<V>> = {
        key: string;
        validation: R;
      };

      const fields = Object.entries<Record<string, unknown>>(value).map(
        ([k, v]) => ({
          key: k,
          validation: validator.validate(v),
        }),
      ) satisfies FieldAndValidation<ValidationResult<V>>[];

      if (
        fields.every(
          (fAndV): fAndV is FieldAndValidation<ValidationSuccess<V>> =>
            fAndV.validation.isValid,
        )
      ) {
        return {
          value: fields
            .map(({ key, validation }) => ({
              [key]: validation.value,
            }))
            .reduce((prev, next) => Object.assign(prev, next), {}),
          isValid: true,
        };
      }

      const validationsOnly = fields
        .filter(
          (fAndV): fAndV is FieldAndValidation<ValidationFailure> =>
            !fAndV.validation.isValid,
        )
        .map(({ key, validation }) => ({ [key]: validation.error }));

      return {
        isValid: false,
        error: new BadObjectError(
          value,
          mergeObjects<IValidationError>(validationsOnly),
        ),
      };
    },
  };
}

/**
 * A validation error raised when a value is `undefined` but was expected to be
 * something else.
 */
export class ValueIsUndefinedError extends ValidationError {
  constructor() {
    super(
      "Value is undefined",
      "The supplied value is undefined, when it should have been something else",
      undefined,
    );
  }
}

/**
 * A validation error raised when a value is `null` but was expected to be
 * something else.
 */
export class ValueIsNullError extends ValidationError {
  constructor() {
    super(
      "Value is null",
      "The supplied value is null, when it should have been something else",
      null,
    );
  }
}

type InferSchema<V extends { [key: string]: Validator<unknown> }> = {
  [K in keyof V]: InferType<V[K]>;
};

/**
 * A {@link Validator} for objects, as produced by {@link object}. In addition to
 * validating, it exposes the underlying `shape` and derived validators
 * (`partial`, `required`, `omit`, `pick`) for refining the schema.
 */
export type ObjectValidator<
  V extends object,
  S extends { [key: string]: Validator<unknown> },
> = Validator<V> &
  Readonly<{
    readonly shape: S;

    /**
     * A validator that validates objects against the same schema, but the
     * fields are optional.
     */
    readonly partial: ObjectValidator<
      Partial<V>,
      {
        [key in keyof V]: Validator<V[key] | undefined>;
      }
    >;

    /**
     * A validator that validates objects against the same schema, but the with
     * the specified keys omitted.
     * @param keys The keys to omit
     * @returns A validator that validates objects against the same schema,
     *   but with the specified keys omitted
     */
    readonly omit: <T extends keyof V>(
      keys: T[],
    ) => ObjectValidator<Omit<V, T>, S>;

    readonly pick: <T extends keyof V>(
      keys: T[],
    ) => ObjectValidator<Pick<V, T>, S>;

    readonly required: ObjectValidator<
      {
        [key in keyof V]: Exclude<V[key], undefined>;
      },
      {
        [key in keyof V]: Validator<Exclude<V[key], undefined>>;
      }
    >;
  }>;

/**
 * A validation error raised when a referenced key does not exist on the
 * supplied object.
 */
export class KeyNotExistError extends ValidationError {
  private _key: unknown;
  constructor(_key: unknown) {
    super(
      "Key does not exist in object",
      `The supplied key ${String(_key)} does not exist in the supplied object`,
      undefined,
    );
    this._key = _key;
  }

  get key() {
    return this._key;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value != null;

declare global {
  interface ObjectConstructor {
    keys<T extends object>(o: T): (keyof T)[];
    entries<T extends object>(o: T): [keyof T, T[keyof T]][];
    fromEntries<K, R>(k: [keyof K, R][]): { [key in keyof K]: R };
  }
}

function mapValues<T extends Record<PropertyKey, unknown>, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R,
): { [K in keyof T]: R } {
  const has = (key: PropertyKey): key is keyof T => {
    return Object.hasOwn(obj, key);
  };
  const isIn = (key: PropertyKey, value: unknown): value is T[keyof T] => {
    isRecord(value);
    return has(key);
  };
  return Object.fromEntries<T, R>(
    Object.entries(obj).map(([k, v]) => {
      if (!has(k)) throw new Error("An unknown error occurred");
      if (!isIn(k, v)) throw new Error("An unknown error occurred");
      return [k, fn(v, k)] satisfies [keyof T, R];
    }) satisfies [keyof T, R][],
  );
}

/**
 * Creates a validator for an object, specified by the "schema".
 *
 * Each field in the "schema" is a validator, and each of them will validate
 * values against objects in concern.
 *
 * ## Usage
 *
 * ```typescript
 * const user = object({
 *   name: string(),
 *   age: number(),
 * });
 *
 * user.validate({ name: "Ada", age: 36 }).isValid; // ✅ true
 * user.validate({ name: "Ada" }).isValid;          // ❌ false (missing age)
 * user.validate({ name: "Ada", age: "36" }).isValid; // ❌ false (age not a number)
 * ```
 * @param shape An object containing fields of nothing but validators, each of
 *   which will be used to validate the value's respective fields
 * @returns A validator that will validate an object against the `schema`
 */
export function object<
  S extends { [key: string]: Validator<unknown> },
  V extends object = InferSchema<S>,
>(shape: S): ObjectValidator<V, S> {
  return {
    get shape() {
      return shape;
    },

    validate: (value: unknown): ValidationResult<V> => {
      // Process of elimination. Check if undefined. If yes, invalid.
      if (value === undefined) {
        return { isValid: false, error: new ValueIsUndefinedError() };
      }
      // Otherwise, not undefined, therefore continue.

      // Check if object. If not, invalid.
      if (!isRecord(value)) {
        return {
          isValid: false,
          error: new UnexpectedTypeofError(value, "object"),
        };
      }
      // Otherwise, an object, therefore continue, because after all, this is
      // what this function is testing for!
      //
      // Note: we deliberately do not pre-check that the value's keys match the
      // shape's keys. Extra fields are allowed, and missing fields are handled
      // by each field's own validator (a missing key reads as `undefined`,
      // which a required validator rejects and an optional one accepts).

      type KeyValidation<R = ValidationResult<unknown>> = {
        key: string;
        validation: R;
      };

      if (!isRecord(shape)) {
        throw new Error("Wtf");
      }

      // Type-assert fields by key and validation result (effectively, rather
      // than an array of key value pairs, instead, it's an array of key and
      // validation result).
      const fields = Object.entries(shape).map(([key, validator]) => {
        const k = String(key);
        return {
          key: k,
          validation: validator.validate(value[k]),
        };
      }) satisfies KeyValidation[];

      const onlyBadFields: KeyValidation<ValidationFailure>[] = fields.filter(
        (keyValidation): keyValidation is KeyValidation<ValidationFailure> =>
          !keyValidation.validation.isValid,
      );

      const f: KeyValidation<ValidationResult<unknown>>[] = fields;

      const onlyGoodFields: KeyValidation<ValidationSuccess<unknown>>[] =
        f.filter(
          (
            keyValidation,
          ): keyValidation is KeyValidation<ValidationSuccess<unknown>> =>
            keyValidation.validation.isValid,
        );

      if (!fields.every((f) => f.validation.isValid)) {
        return {
          isValid: false,
          error: new BadObjectError(
            value,
            mergeObjects(
              onlyBadFields.map(({ key, validation }) => ({
                [key]: validation.error,
              })),
            ),
          ),
        } satisfies ValidationResult<V>;
      }

      return {
        value: Object.assign(
          { ...value },
          onlyGoodFields
            // Only write back keys that were actually present in the input.
            // A field absent from the input but optional in the schema
            // validates (as `undefined`) without us materializing a spurious
            // `key: undefined` entry on the result.
            .filter(({ key }) => Object.hasOwn(value, key))
            .map(({ key, validation }) => {
              return {
                [key]: validation.value,
              };
            })
            .reduce((prev, next) => Object.assign(prev, next), {}) as V,
        ),
        isValid: true,
      } satisfies ValidationResult<V>;
    },
    get partial(): ObjectValidator<
      Partial<V>,
      {
        [key in keyof V]: Validator<V[key] | undefined>;
      }
    > {
      return object(
        mapValues(shape, (v) => either(v, exact(undefined))) as {
          [key in keyof V]: Validator<V[key] | undefined>;
        },
      );
    },
    omit: () => object(shape),
    pick: () => object(shape),
    get required(): ObjectValidator<
      {
        [key in keyof V]: Exclude<V[key], undefined>;
      },
      {
        [key in keyof V]: Validator<Exclude<V[key], undefined>>;
      }
    > {
      return object(
        mapValues(shape, (v) =>
          exclude(v as Validator<V[keyof V]>, exact(undefined)),
        ) as {
          [key in keyof V]: Validator<Exclude<V[key], undefined>>;
        },
      );
    },
  };
}

/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
 *
 * ## Usage
 *
 * ```typescript
 * const anything = unknown();
 *
 * anything.validate(42).isValid;      // ✅ true
 * anything.validate("hi").isValid;    // ✅ true
 * anything.validate(null).isValid;    // ✅ true
 * ```
 * @returns A validator that will validate *all* objects
 */
export function unknown(): Validator<unknown> {
  return {
    validate: (value: unknown) => ({ isValid: true, value }),
  };
}

/**
 * Creates a validator that lazily evaluates the callback, at every validation.
 *
 * Useful for recursive types, such as a node for a tree.
 *
 * ## Usage
 *
 * ```typescript
 * type Tree = { value: number; children: Tree[] };
 *
 * // `lazy` defers referencing `tree` until validation time, so the validator
 * // can refer to itself.
 * const tree: Validator<Tree> = object({
 *   value: number(),
 *   children: lazy(() => arrayOf(tree)),
 * });
 *
 * tree.validate({ value: 1, children: [{ value: 2, children: [] }] }).isValid; // ✅ true
 * ```
 * @param schemaFn A function that returns a validator
 * @returns A validator, effectively just a "forwarding" of the validator
 *   returned by the `schemaFn`
 */
export function lazy<V>(schemaFn: () => Validator<V>): Validator<V> {
  return {
    validate: (value: unknown) => schemaFn().validate(value),
  };
}

/**
 * A validation error raised when a {@link transform} parser throws, wrapping the
 * thrown error in `errorObject`.
 */
export class TransformError extends ValidationError {
  public errorObject: unknown;

  constructor(value: unknown, errorObject: unknown) {
    super("Parsing error", "Failed to parse the value", value);
    this.errorObject = errorObject;
  }
}

/**
 * Creates a validator that first validates the supplied value against
 * `validator`, then maps the validated value through `parse`.
 *
 * Because the input is validated up front, the `parse` callback receives a
 * value already narrowed to the validator's type, rather than `unknown`. To
 * transform an arbitrary value with no prior validation, pass {@link unknown}
 * as the validator.
 *
 * ## Usage
 *
 * ```typescript
 * // `value` is inferred as `string`, so no cast is needed.
 * const toDate = transform(string(), (value) => new Date(value));
 *
 * toDate.validate("1970-01-01T00:00:00.000Z").isValid; // ✅
 * toDate.validate(42).isValid;                          // ❌ not a string
 * ```
 * @param validator The validator the value must satisfy before being parsed
 * @param parse The parser, receiving the validated value
 * @returns A validator that validates then maps the value
 */
export const transform = <I, O>(
  validator: Validator<I>,
  parse: (value: I) => O,
): Validator<O> => ({
  validate(value: unknown): ValidationResult<O> {
    const validation = validator.validate(value);
    if (validation.isValid === false) {
      return validation;
    }
    try {
      return { isValid: true, value: parse(validation.value) };
    } catch (e) {
      return { isValid: false, error: new TransformError(value, e) };
    }
  },
});

class PredicateError extends ValidationError {
  constructor(value: unknown) {
    super("Predicate failure", "The predicate failed to match", value);
  }
}

/**
 * A validator creator that also accepts a predicate
 *
 * ## Usage
 *
 * ```typescript
 * // A string of at least 8 characters. `value` is typed as `string`.
 * const password = predicate(string(), (value) => value.length >= 8);
 *
 * password.validate("hunter2000").isValid; // ✅ true
 * password.validate("short").isValid;      // ❌ false (fails the predicate)
 * password.validate(42).isValid;           // ❌ false (not a string)
 * ```
 * @param validator The validator to run the predicate against
 * @param pred The predicate to run against the value
 * @returns A Validator, where if the predicate were to fail, it will result in
 *   a failed validation
 */
export function predicate<T>(
  validator: Validator<T>,
  pred: (value: T) => boolean,
): Validator<T> {
  return {
    validate(value: unknown): ValidationResult<T> {
      const validation = validator.validate(value);
      return validation.isValid === false
        ? validation
        : pred(validation.value)
          ? { isValid: true, value: validation.value }
          : { isValid: false, error: new PredicateError(value) };
    },
  };
}

/**
 * A Validator creator that substitutes the error from one validator, to another
 * error for that validator.
 *
 * ## Usage
 *
 * ```typescript
 * class NotAName extends ValidationError {
 *   constructor(value: unknown) {
 *     super("Not a name", "Expected a name string", value);
 *   }
 * }
 *
 * // Same validation as `string()`, but with a custom error on failure.
 * const name = replaceError(string(), (value) => new NotAName(value));
 *
 * name.validate("Ada").isValid; // ✅ true
 * name.validate(42).isValid;    // ❌ false (fails with a NotAName error)
 * ```
 * @param validator The validator for which to have the error substituted
 * @param createError An error function that will return the appropriate error
 *   object
 * @returns A validator
 */
export function replaceError<T>(
  validator: Validator<T>,
  createError: (value: unknown, error: IValidationError) => IValidationError,
): Validator<T> {
  return {
    validate(value: unknown) {
      const validation = validator.validate(value);
      return validation.isValid === false
        ? { isValid: false, error: createError(value, validation.error) }
        : { isValid: true, value: validation.value };
    },
  };
}

/**
 * Chains two validators together.
 *
 * The value (possibly transformed) produced by `left` is fed into `right`, so
 * this is how you compose, for example, a parse step with a shape check.
 *
 * ## Usage
 *
 * ```typescript
 * // Validate a string, then constrain it to a minimum length.
 * const nonEmpty = chain(string(), predicate(string(), (s) => s.length > 0));
 *
 * nonEmpty.validate("hi").isValid; // ✅ true
 * nonEmpty.validate("").isValid;   // ❌ false (empty)
 * nonEmpty.validate(42).isValid;   // ❌ false (not a string)
 * ```
 * @param left the first validator to validate values against
 * @param right the second validator to validate values against
 * @returns a validator that will validate first against the first validator
 *   then the second validator
 */
export const chain = <T1, T2>(
  left: Validator<T1>,
  right: Validator<T2>,
): Validator<T2> => ({
  validate(value) {
    const validation = left.validate(value);
    return validation.isValid === false
      ? { isValid: false, error: validation.error }
      : right.validate(validation.value);
  },
});

/**
 * Gets the intersection of two validators
 *
 * ## Usage
 *
 * ```typescript
 * const named = object({ name: string() });
 * const aged = object({ age: number() });
 *
 * // Must satisfy both shapes: { name: string } & { age: number }.
 * const person = intersection(named, aged);
 *
 * person.validate({ name: "Ada", age: 36 }).isValid; // ✅ true
 * person.validate({ name: "Ada" }).isValid;          // ❌ false (missing age)
 * ```
 * @param a The first validator to validate the object against
 * @param b The second validator to validate the object against
 * @returns A validator that is the intersection of the types represented by
 *   validators a and b
 */
export const intersection = <T1, T2>(
  a: Validator<T1>,
  b: Validator<T2>,
): Validator<T1 & T2> => ({
  validate(value) {
    const validation1 = a.validate(value);
    if (validation1.isValid === false) {
      return { isValid: false, error: validation1.error };
    }
    const validation2 = b.validate(validation1.value);
    return (
      validation2.isValid === false
        ? { isValid: false, error: validation2.error }
        : { isValid: true, value: validation2.value }
    ) as ValidationResult<T1 & T2>;
  },
});

/**
 * Creates a validator that can fallback to another value.
 *
 * ## Usage
 *
 * ```typescript
 * // Use the given number, or default to 0 when the value isn't a number.
 * const count = fallback(number(), () => 0);
 *
 * count.validate(42);    // { isValid: true, value: 42 }
 * count.validate("nope"); // { isValid: true, value: 0 }  (fell back)
 * ```
 * @param validator The validator that, if failed, will need a fallback
 * @param getFallback The function to acquire the fallback value
 * @returns A validator that should never be invalid
 */
export const fallback = <T1, T2>(
  validator: Validator<T1>,
  getFallback: () => T2,
): Validator<T1 | T2> => ({
  validate(value) {
    const validation = validator.validate(value);
    return validation.isValid === false
      ? { isValid: true, value: getFallback() }
      : validation;
  },
});

class ValidationErrorWrappedError extends Error {
  public error: IValidationError;
  constructor(error: IValidationError) {
    super(error.errorMessage);
    this.error = error;
  }
}

/**
 * This function validates and returns the parsed value. If validation failed,
 * it will throw a runtime exception
 *
 * ## Usage
 *
 * ```typescript
 * const user = object({ name: string(), age: number() });
 *
 * // Returns the typed value on success...
 * const value = validate(user, { name: "Ada", age: 36 });
 * value.name; // "Ada", typed as string
 *
 * // ...and throws the ValidationError on failure.
 * validate(user, { name: "Ada" }); // throws
 * ```
 * @param validator A validator to run the validation against the supplied value
 * @param value The value to run the validation against
 * @returns The outcome of the validation
 */
export const validate = <T>(validator: Validator<T>, value: unknown): T => {
  const result = validator.validate(value);
  if (result.isValid === false) {
    if (result.error instanceof Error) throw result.error;
    throw new ValidationErrorWrappedError(result.error);
  }
  return result.value;
};
