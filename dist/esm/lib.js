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
        this.fullStack = this.stack;
    }
}
export class EitherError extends ValidationError {
    constructor(value, validationResults) {
        super("Either error", "The provided value does not match any of the possible validators", value);
        this.validationResults = validationResults;
    }
}
export class TupleError extends ValidationError {
    constructor(value, validationResults) {
        super("Tuple error", `The supplied tuple had ${validationResults.filter((validation) => !validation.isValid)} issues`, value);
        this.validationResults = validationResults;
    }
}
export class NotAnArrayError extends ValidationError {
    constructor(value) {
        super("Not an array error", "Expected an array, but instead got something else", value);
    }
}
export class UnexpectedArrayLengthError extends ValidationError {
    constructor(value, expectedLength) {
        super("Unexpected array length error", `Expected an array of length ${expectedLength} but instead got ${value.length}`, value);
        this.expectedLength = expectedLength;
    }
}
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
export function either(...alts) {
    return {
        __: {},
        validate: (value) => {
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
export function tuple(t) {
    return {
        __: {},
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
            return validations.every((validation) => validation.isValid)
                ? { isValid: true, value }
                : {
                    isValid: false,
                    error: new TupleError(value, validations),
                };
        },
    };
}
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
export function except(validator, invalidator) {
    return {
        __: {},
        validate: (value) => {
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
function _v(v) {
    return typeof v;
}
const _s = _v({});
export class UnexpectedTypeofValue extends ValidationError {
    constructor(value, expectedType) {
        super("Unexpected typeof", `Expected a value of type ${expectedType}, but got something else`, value);
        this.expectedType = expectedType;
    }
}
/**
 * Creates a validator that determines if the supplied value is a string.
 * @returns A validator to check if the value is of type string
 */
export const string = () => {
    return {
        __: "",
        validate: (value) => typeof value !== "string"
            ? { isValid: false, error: new UnexpectedTypeofValue(value, "string") }
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
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
export function exact(expected) {
    return {
        __: {},
        validate: (value) => value !== expected
            ? { isValid: false, error: new NotExactValueError(value, expected) }
            : { value, isValid: true },
    };
}
/**
 * Creates a validator that determines if the supplied value is a number.
 * @returns A validator to check if the value is of type number
 */
export const number = () => ({
    __: 0,
    validate: (value) => typeof value !== "number"
        ? { isValid: false, error: new UnexpectedTypeofValue(value, "number") }
        : { value, isValid: true },
});
/**
 * Creates a validator that determines if the supplied value is a boolean.
 * @returns A validator to check if the value is of type boolean
 */
export const boolean = () => ({
    __: false,
    validate: (value) => typeof value !== "boolean"
        ? { isValid: false, error: new UnexpectedTypeofValue(value, "boolean") }
        : { value, isValid: true },
});
export class ArrayOfInvalidValuesError extends ValidationError {
    constructor(value, errors) {
        super("Array of invalid values", `${errors.length} of the ${value.length} are invalid`, value);
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
export function arrayOf(validator) {
    return {
        __: [],
        validate: (value) => {
            if (!Array.isArray(value)) {
                return { isValid: false, error: new NotAnArrayError(value) };
            }
            const validations = value.map((v) => validator.validate(v));
            return validations.every(({ isValid }) => isValid)
                ? { value, isValid: true }
                : {
                    isValid: false,
                    error: new ArrayOfInvalidValuesError(value, validations
                        .map((v, i) => ({ index: i, validation: v }))
                        .filter(({ validation }) => !validation.isValid)),
                };
        },
    };
}
export class BadObjectError extends ValidationError {
    constructor(value, objectSchema) {
        super("Bad object", "The supplied object had fields that failed to validate", value);
        this.objectSchema = objectSchema;
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
 * @param validator The validator to validate the individual fields in the
 *   object
 * @returns A validator that determines if the supplied value is an object,
 *   whose fields contains are of nothing but types as defined by the specified
 *   validator.
 */
export function objectOf(validator) {
    return {
        __: {},
        validate: (value) => {
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
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(({ validation }) => !validation.isValid)
                        .map(({ key, validation }) => ({ [key]: validation })))),
                };
        },
    };
}
function validValidator(value) {
    return value && typeof value.validate === "function"
        ? { valid: true, validator: value }
        : { valid: false };
}
export class ValueIsUndefinedError extends ValidationError {
    constructor() {
        super("Value is undefined", "The supplied value is undefined, when it should have been something else", undefined);
    }
}
export class ValueIsNullError extends ValidationError {
    constructor() {
        super("Value is null", "The supplied value is null, when it should have been something else", null);
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
export function object(schema) {
    return {
        __: {},
        validate: (value) => {
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
                validation: schema[key].validate(value[key]),
            }));
            return fields.every(({ validation }) => validation.isValid)
                ? { value, isValid: true }
                : {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(({ validation }) => !validation.isValid)
                        .map(({ key, validation }) => ({ [key]: validation })))),
                };
        },
    };
}
/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
 * @returns A validator that will validate *all* objects
 */
export function any() {
    return {
        __: "",
        validate: (value) => ({ isValid: true, value }),
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
export function lazy(schemaFn) {
    return {
        __: {},
        validate: (value) => schemaFn().validate(value),
    };
}
//# sourceMappingURL=lib.js.map