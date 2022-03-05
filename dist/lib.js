"use strict";
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
exports.__esModule = true;
exports.lazy = exports.any = exports.object = exports.objectOf = exports.arrayOf = exports.boolean = exports.number = exports.exact = exports.string = exports.except = exports.tuple = exports.either = void 0;
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
function either() {
    var alts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        alts[_i] = arguments[_i];
    }
    return {
        __: {},
        validate: function (value) {
            var validations = alts.map(function (validator) { return validator.validate(value); });
            return validations.some(function (validation) { return validation.isValid; })
                ? { isValid: true, value: value, __: value }
                : {
                    isValid: false,
                    __: value,
                    error: {
                        message: "The value ".concat(value !== undefined || value !== null
                            ? value.toString() + " "
                            : "", "is not valid according to any of the validators"),
                        value: value,
                        details: validations
                            .map(function (validation) {
                            return !validation.isValid ? validation.error : null;
                        })
                            .filter(function (validation) { return !!validation; })
                    }
                };
        }
    };
}
exports.either = either;
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
function tuple(t) {
    return {
        __: {},
        validate: function (value) {
            if (!Array.isArray(value)) {
                return {
                    isValid: false,
                    error: {
                        message: "The provided value is not an array",
                        value: value,
                        details: {
                            tupleValidators: t
                        }
                    }
                };
            }
            if (t.length !== value.length) {
                return {
                    isValid: false,
                    error: {
                        message: "Expected an array of length ".concat(t.length, ", but got ").concat(value.length),
                        value: value,
                        details: {
                            tupleValidators: t,
                            expectedLength: t.length,
                            actualLength: value.length
                        }
                    }
                };
            }
            var validations = t.map(function (validator, i) { return validator.validate(value[i]); });
            return validations.every(function (validation, i) { return validation.isValid; })
                ? { isValid: true, value: value }
                : {
                    isValid: false,
                    error: {
                        message: "".concat(validations.filter(function (validation) { return !validation.isValid; }).length, " of the ").concat(validations.length, " tuple items are invalid"),
                        value: value,
                        details: {}
                    }
                };
        }
    };
}
exports.tuple = tuple;
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
 * everythingButValidator.validate("but").isValid; // ✅
 * ```
 * @param validator The validator for which to validate the value against
 * @param invalidator The validator for which if is valid, the value will be
 *   rejected
 * @returns A Validator that will reject all values for which the invalidator
 *   validates the object
 */
function except(validator, invalidator) {
    return {
        __: {},
        validate: function (value) {
            return validator.validate(value).isValid && !invalidator.validate(value).isValid
                ? { isValid: true, value: value }
                : { isValid: false };
        }
    };
}
exports.except = except;
/**
 * Creates a validator that determines if the supplied value is a string.
 * @returns A validator to check if the value is of type string
 */
var string = function () {
    return {
        __: "",
        validate: function (value) {
            return typeof value !== "string" ? { isValid: false } : { value: value, isValid: true };
        }
    };
};
exports.string = string;
/**
 * Creates a validator that validates values that match the expected value
 * exactly.
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
function exact(expected) {
    return {
        __: {},
        validate: function (value) {
            return value !== expected ? { isValid: false } : { value: value, isValid: true };
        }
    };
}
exports.exact = exact;
/**
 * Creates a validator that determines if the supplied value is a number.
 * @returns A validator to check if the value is of type number
 */
var number = function () { return ({
    __: 0,
    validate: function (value) {
        return typeof value !== "number" ? { isValid: false } : { value: value, isValid: true };
    }
}); };
exports.number = number;
/**
 * Creates a validator that determines if the supplied value is a boolean.
 * @returns A validator to check if the value is of type boolean
 */
var boolean = function () { return ({
    __: false,
    validate: function (value) {
        return typeof value !== "boolean" ? { isValid: false } : { value: value, isValid: true };
    }
}); };
exports.boolean = boolean;
/**
 * Creates a validator that determines if the supplied value is an array of the
 * specified validator.
 * @param validator The validator to validate the individual array values
 *   against
 * @returns A validator to check if the value is an array of the specified
 *   validator
 */
function arrayOf(validator) {
    return {
        __: [],
        validate: function (value) {
            return Array.isArray(value) &&
                value.every(function (value, i) { return validator.validate(value).isValid; })
                ? { value: value, isValid: true }
                : { isValid: false };
        }
    };
}
exports.arrayOf = arrayOf;
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
function objectOf(validator) {
    return {
        __: {},
        validate: function (value) {
            return !!value &&
                typeof value === "object" &&
                Object.keys(value).every(function (key) { return validator.validate(value[key]).isValid; })
                ? { value: value, isValid: true }
                : { isValid: false };
        }
    };
}
exports.objectOf = objectOf;
function validValidator(value) {
    return value && typeof value.validate === "function"
        ? { valid: true, validator: value }
        : { valid: false };
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
function object(schema) {
    return {
        __: {},
        validate: function (value) {
            return !!value &&
                typeof value === "object" &&
                Object.keys(schema).every(function (key) {
                    var validation = validValidator(schema[key]);
                    if (validation.valid) {
                        return validation.validator.validate(value[key]).isValid;
                    }
                    else {
                        throw new Error("Something went wrong");
                    }
                })
                ? { value: value, isValid: true, __: value }
                : { isValid: false, __: value };
        }
    };
}
exports.object = object;
/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
 * @returns A validator that will validate *all* objects
 */
function any() {
    return {
        __: "",
        validate: function (value) { return ({ isValid: true, value: value }); }
    };
}
exports.any = any;
/**
 * Creates a validator that lazily evaluates the callback, at every validation.
 *
 * Useful for recursive types, such as a node for a tree.
 * @param schemaFn A function that returns a validator
 * @returns A validator, effectively just a "forwarding" of the validator
 *   returned by the `schemaFn`
 */
function lazy(schemaFn) {
    return {
        __: {},
        validate: function (value) { return schemaFn().validate(value); }
    };
}
exports.lazy = lazy;
