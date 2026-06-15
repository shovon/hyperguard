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
 * A base abstract class that represents a generic validation error.
 */
export class ValidationError extends Error {
    /**
     *
     * @param type A string representing what type of validation error that the
     *   error represents
     * @param errorMessage Some detail regarding the nature of the error
     * @param value The original value that triggered the validation error
     */
    constructor(type, errorMessage, value) {
        super(errorMessage);
        this.type = type;
        this.errorMessage = errorMessage;
        this.value = value;
    }
}
/**
 * A validation error raised when a value fails to match any of the validators
 * supplied to {@link either}.
 */
export class EitherError extends ValidationError {
    constructor(value, validationResults) {
        super("Either error", "The provided value does not match any of the possible validators", value);
        this.validationResults = validationResults;
    }
}
/**
 * A validation error raised when one or more elements of a tuple fail to
 * validate against their respective validators in {@link tuple}.
 */
export class TupleError extends ValidationError {
    constructor(value, validationResults) {
        super("Tuple error", `The supplied tuple had ${validationResults.filter((validation) => !validation.isValid)} issues`, value);
        this.validationResults = validationResults;
    }
}
/**
 * A validation error raised when a value was expected to be an array but was
 * something else.
 */
export class NotAnArrayError extends ValidationError {
    constructor(value) {
        super("Not an array error", "Expected an array, but instead got something else", value);
    }
}
/**
 * A validation error raised when an array's length does not match the length
 * expected by the validator (e.g. a {@link tuple}).
 */
export class UnexpectedArrayLengthError extends ValidationError {
    constructor(value, expectedLength) {
        super("Unexpected array length error", `Expected an array of length ${expectedLength} but instead got ${value.length}`, value);
        this.expectedLength = expectedLength;
    }
}
const first = (arr) => {
    if (arr.length <= 0)
        throw new Error("Array is empty");
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
export function either(...alts) {
    return {
        validate: (value) => {
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
    };
}
/**
 * A validation error raised when a value validates against the excluded
 * validator in {@link exclude}, meaning it includes a value it shouldn't.
 */
export class ExcludedIncludedError extends ValidationError {
    constructor(value, validationResults) {
        super("Exclude error", `Value includes a value that it shouldn't`, value);
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
export function exclude(a, b) {
    return {
        validate: (value) => {
            const aValidation = a.validate(value);
            const bValidation = b.validate(value);
            if (!aValidation.isValid) {
                return {
                    isValid: false,
                    error: aValidation.error,
                };
            }
            const isNotT = (val) => !bValidation.isValid;
            if (isNotT(aValidation.value)) {
                return {
                    isValid: true,
                    value: aValidation.value,
                };
            }
            return {
                isValid: false,
                error: new ExcludedIncludedError("Exclude error", bValidation),
            };
        },
    };
}
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
export function tuple(t) {
    return {
        validate: (value) => {
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
            const allValid = (results) => results.every((validation) => validation.isValid);
            if (!allValid(validations)) {
                return {
                    isValid: false,
                    error: new TupleError(value, validations.filter((validation) => !validation.isValid)),
                };
            }
            // Return the validated (and possibly transformed) values rather than the
            // raw input, so per-element transforms are carried through. The `.map`
            // erases the positional tuple types, so we reassert the tuple shape here.
            return {
                isValid: true,
                value: validations.map((validation) => validation.value),
            };
        },
    };
}
/**
 * A validation error raised when a value matches a validator that was supposed
 * to reject it (e.g. the invalidator in {@link except}).
 */
export class UnexpectedValueError extends ValidationError {
    constructor(value) {
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
export function except(validator, invalidator) {
    return {
        validate: (value) => {
            const validation = validator.validate(value);
            if (validation.isValid === false) {
                return { isValid: false, error: validation.error };
            }
            return validation.isValid && !invalidator.validate(value).isValid
                ? { isValid: true, value: validation.value }
                : { isValid: false, error: new UnexpectedValueError(value) };
        },
    };
}
function _v(v) {
    return typeof v;
}
const _s = _v({});
/**
 * A validation error raised when the `typeof` a value does not match the
 * expected type.
 */
export class UnexpectedTypeofError extends ValidationError {
    constructor(value, expectedType) {
        super("Unexpected typeof", `Expected a value of type ${expectedType}, but got something else`, value);
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
export const string = () => {
    return {
        validate: (value) => typeof value !== "string"
            ? { isValid: false, error: new UnexpectedTypeofError(value, "string") }
            : { value, isValid: true },
    };
};
class NotExactValueError extends ValidationError {
    constructor(value, expectedValue) {
        super("Incorrect value", `Expected the value to equal exactly ${expectedValue} but instead got something else`, value);
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
export function exact(expected) {
    return {
        validate: (value) => {
            const is = (v, expected) => Object.is(value, expected);
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
export const number = () => ({
    validate: (value) => typeof value !== "number"
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
export const boolean = () => ({
    validate: (value) => typeof value !== "boolean"
        ? { isValid: false, error: new UnexpectedTypeofError(value, "boolean") }
        : { value, isValid: true },
});
/**
 * A validation error raised when a value is not an instance of the constructor
 * expected by {@link instance}.
 */
export class NotAnInstanceError extends ValidationError {
    constructor(value, expectedConstructor) {
        super("Not an instance error", `Expected an instance of ${expectedConstructor.name}, but got something else`, value);
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
export function instance(constructor) {
    return {
        validate: (value) => value instanceof constructor
            ? { isValid: true, value: value }
            : { isValid: false, error: new NotAnInstanceError(value, constructor) },
    };
}
/**
 * A validation error raised when one or more elements of an array fail to
 * validate in {@link arrayOf}, collecting each offending element and its index.
 */
export class ArrayOfInvalidValuesError extends ValidationError {
    constructor(value, errors) {
        super("Array of invalid values", `${errors.length} of the ${value.length} are invalid`, value);
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
export function arrayOf(validator) {
    return {
        validate: (value) => {
            if (!Array.isArray(value)) {
                return { isValid: false, error: new NotAnArrayError(value) };
            }
            const validations = value.map((v) => validator.validate(v));
            return validations.every((validation) => validation.isValid)
                ? {
                    value: validations.map((validation) => validation.value),
                    isValid: true,
                }
                : {
                    isValid: false,
                    error: new ArrayOfInvalidValuesError(value, validations
                        .map((v, i) => ({ index: i, validation: v }))
                        .filter(({ validation }) => !validation.isValid)),
                };
        },
    };
}
/**
 * A validation error raised when one or more fields of an object fail to
 * validate (in {@link object} or {@link objectOf}), keyed by field name.
 */
export class BadObjectError extends ValidationError {
    constructor(value, faultyFields) {
        super("Bad object", "The supplied object had fields that failed to validate", value);
        this.faultyFields = faultyFields;
    }
}
function mergeObjects(objects) {
    const result = {};
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
export function objectOf(validator) {
    return {
        validate: (value) => {
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
            const fields = Object.entries(value).map(([k, v]) => ({
                key: k,
                validation: validator.validate(v),
            }));
            if (fields.every((fAndV) => fAndV.validation.isValid)) {
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
                .filter((fAndV) => !fAndV.validation.isValid)
                .map(({ key, validation }) => ({ [key]: validation.error }));
            return {
                isValid: false,
                error: new BadObjectError(value, mergeObjects(validationsOnly)),
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
        super("Value is undefined", "The supplied value is undefined, when it should have been something else", undefined);
    }
}
/**
 * A validation error raised when a value is `null` but was expected to be
 * something else.
 */
export class ValueIsNullError extends ValidationError {
    constructor() {
        super("Value is null", "The supplied value is null, when it should have been something else", null);
    }
}
/**
 * A validation error raised when a referenced key does not exist on the
 * supplied object.
 */
export class KeyNotExistError extends ValidationError {
    constructor(_key) {
        super("Key does not exist in object", `The supplied key ${_key} does not exist in the supplied object`, undefined);
        this._key = _key;
    }
    get key() {
        return this._key;
    }
}
const isRecord = (value) => typeof value === "object" && value != null;
function mapValues(obj, fn) {
    const has = (key) => {
        return Object.hasOwn(obj, key);
    };
    const isIn = (key, value) => {
        return has(key);
    };
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => {
        if (!has(k))
            throw new Error("An unknown error occurred");
        if (!isIn(k, v))
            throw new Error("An unknown error occurred");
        return [k, fn(v, k)];
    }));
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
export function object(shape) {
    return {
        get shape() {
            return shape;
        },
        validate: (value) => {
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
            // Type-assert fields by key and validation result (effectively, rather
            // than an array of key value pairs, instead, it's an array of key and
            // validation result).
            const fields = Object.entries(shape).map(([key, validator]) => ({
                key,
                validation: validator.validate(value[key]),
            }));
            const onlyBadFields = fields.filter((keyValidation) => !keyValidation.validation.isValid);
            const f = fields;
            const onlyGoodFields = f.filter((keyValidation) => keyValidation.validation.isValid);
            if (!fields.every((f) => f.validation.isValid)) {
                return {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(onlyBadFields.map(({ key, validation }) => ({
                        [key]: validation.error,
                    })))),
                };
            }
            return {
                value: Object.assign({ ...value }, onlyGoodFields
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
                    .reduce((prev, next) => Object.assign(prev, next), {})),
                isValid: true,
            };
        },
        get partial() {
            return object(mapValues(shape, (v) => either(v, exact(undefined))));
        },
        omit: () => object(shape),
        pick: () => object(shape),
        get required() {
            return object(mapValues(shape, (v) => exclude(v, exact(undefined))));
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
export function unknown() {
    return {
        validate: (value) => ({ isValid: true, value }),
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
export function lazy(schemaFn) {
    return {
        validate: (value) => schemaFn().validate(value),
    };
}
/**
 * A validation error raised when a {@link transform} parser throws, wrapping the
 * thrown error in `errorObject`.
 */
export class TransformError extends ValidationError {
    constructor(value, errorObject) {
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
export const transform = (validator, parse) => ({
    validate(value) {
        const validation = validator.validate(value);
        if (validation.isValid === false) {
            return validation;
        }
        try {
            return { isValid: true, value: parse(validation.value) };
        }
        catch (e) {
            return { isValid: false, error: new TransformError(value, e) };
        }
    },
});
class PredicateError extends ValidationError {
    constructor(value) {
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
export function predicate(validator, pred) {
    return {
        validate(value) {
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
export function replaceError(validator, createError) {
    return {
        validate(value) {
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
export const chain = (left, right) => ({
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
export const intersection = (a, b) => ({
    validate(value) {
        const validation1 = a.validate(value);
        if (validation1.isValid === false) {
            return { isValid: false, error: validation1.error };
        }
        const validation2 = b.validate(validation1.value);
        return (validation2.isValid === false
            ? { isValid: false, error: validation2.error }
            : { isValid: true, value: validation2.value });
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
export const fallback = (validator, getFallback) => ({
    validate(value) {
        const validation = validator.validate(value);
        return validation.isValid === false
            ? { isValid: true, value: getFallback() }
            : validation;
    },
});
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
export const validate = (validator, value) => {
    const result = validator.validate(value);
    if (result.isValid === false) {
        throw result.error;
    }
    return result.value;
};
//# sourceMappingURL=lib.js.map