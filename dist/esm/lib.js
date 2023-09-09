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
        validate: (value) => {
            const validations = alts.map((validator) => validator.validate(value));
            return validations.some((validation) => validation.isValid)
                ? {
                    isValid: true,
                    value: validations.filter((v) => v.isValid)[0].value,
                }
                : {
                    isValid: false,
                    error: new EitherError(value, validations),
                };
        },
    };
}
export class ExcludeError extends ValidationError {
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
            if (aValidation.isValid && !bValidation.isValid) {
                return {
                    isValid: true,
                    value: aValidation.value,
                };
            }
            return {
                isValid: false,
                error: new ExcludeError("Exclude error", value),
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
                ? {
                    isValid: true,
                    value: validations.map((v) => v.isValid && v.value),
                }
                : {
                    isValid: false,
                    error: new TupleError(value, validations.filter((validation) => !validation.isValid)),
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
export class UnexpectedTypeofError extends ValidationError {
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
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
export function exact(expected) {
    return {
        validate: (value) => Object.is(value, expected)
            ? { value, isValid: true }
            : { isValid: false, error: new NotExactValueError(value, expected) },
    };
}
/**
 * Creates a validator that determines if the supplied value is a number.
 * @returns A validator to check if the value is of type number
 */
export const number = () => ({
    validate: (value) => typeof value !== "number"
        ? { isValid: false, error: new UnexpectedTypeofError(value, "number") }
        : { value, isValid: true },
});
/**
 * Creates a validator that determines if the supplied value is a boolean.
 * @returns A validator to check if the value is of type boolean
 */
export const boolean = () => ({
    validate: (value) => typeof value !== "boolean"
        ? { isValid: false, error: new UnexpectedTypeofError(value, "boolean") }
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
        validate: (value) => {
            if (!Array.isArray(value)) {
                return { isValid: false, error: new NotAnArrayError(value) };
            }
            const validations = value.map((v) => validator.validate(v));
            return validations.every(({ isValid }) => isValid)
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
            if (value === null) {
                return { isValid: false, error: new ValueIsNullError() };
            }
            if (typeof value !== "object") {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(value, "object"),
                };
            }
            const fields = Object.keys(value).map((key) => ({
                key,
                validation: validator.validate(value[key]),
            }));
            return fields.every(({ validation }) => validation.isValid)
                ? {
                    value: fields
                        .map(({ key, validation }) => ({
                        [key]: validation.value,
                    }))
                        .reduce((prev, next) => Object.assign(prev, next), {}),
                    isValid: true,
                }
                : {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(({ validation }) => !validation.isValid)
                        .map(({ key, validation }) => ({ [key]: validation })))),
                };
        },
    };
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
function objectEntries(o) {
    return Object.entries(o);
}
export class KeyNotExistError extends ValidationError {
    constructor(key) {
        super("Key does not exist in object", `The supplied key ${key} does not exist in the supplied object`, undefined);
        this.key = key;
    }
}
export function keyOf(o) {
    return {
        validate: (value) => {
            if (typeof o !== "object" || o === null) {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(o, "object"),
                };
            }
            if (!Object.keys(o).includes(value)) {
                return {
                    isValid: false,
                    error: new KeyNotExistError(value),
                };
            }
            return {
                isValid: true,
                value
            };
        },
    };
}
/**
 * Creates a validator for an object, specified by the "schema".
 *
 * Each field in the "schema" is a validator, and each of them will validate
 * values against objects in concern.
 * @param shape An object containing fields of nothing but validators, each of
 *   which will be used to validate the value's respective fields
 * @returns A validator that will validate an object against the `schema`
 */
export function object(shape) {
    return {
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
                    error: new UnexpectedTypeofError(value, "object"),
                };
            }
            const fields = Object.keys(shape).map((key) => ({
                key,
                validation: shape[key].validate(value[key]),
            }));
            return fields.every(({ validation }) => validation.isValid)
                ? {
                    value: Object.assign({ ...value }, fields
                        .filter(({ validation }) => !!validation.value)
                        .map(({ key, validation }) => ({
                        [key]: validation.value,
                    }))
                        .reduce((prev, next) => Object.assign(prev, next), {})),
                    isValid: true,
                }
                : {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(({ validation }) => !validation.isValid)
                        .map(({ key, validation }) => ({ [key]: validation })))),
                };
        },
        get partial() {
            const partialSchema = {};
            for (const [key, validator] of objectEntries(shape)) {
                partialSchema[key] = either(validator, exact(undefined));
            }
            return object(partialSchema);
        },
        shape,
        omit: () => object(shape),
        pick: () => object(shape),
        get required() {
            const requiredSchema = {};
            for (const [key, validator] of Object.entries(shape)) {
                const k = key;
                requiredSchema[k] = exclude(validator, either(exact(undefined), exact(null)));
            }
            return object(requiredSchema);
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
        validate: (value) => ({ isValid: true, value }),
    };
}
/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
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
 * @param schemaFn A function that returns a validator
 * @returns A validator, effectively just a "forwarding" of the validator
 *   returned by the `schemaFn`
 */
export function lazy(schemaFn) {
    return {
        validate: (value) => schemaFn().validate(value),
    };
}
export class TransformError extends ValidationError {
    constructor(value, errorObject) {
        super("Parsing error", "Failed to parse the value", value);
        this.errorObject = errorObject;
    }
}
/**
 * Creates a validator that will parse the supplied value
 *
 * @param parse The parser function that will parse the supplied value
 * @returns A validator to validate the value against
 */
export const transform = (parse) => ({
    validate(value) {
        try {
            return { isValid: true, value: parse(value) };
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