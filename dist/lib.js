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
        __outputType: {},
        validate: function (value) {
            return alts.some(function (validator) { return validator.validate(value).isValid; })
                ? { isValid: true, value: value, __outputType: value }
                : { isValid: false, __outputType: value };
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
        __outputType: {},
        validate: function (value) {
            return Array.isArray(value) &&
                t.length === value.length &&
                t.every(function (validator, i) { return validator.validate(value[i]).isValid; })
                ? { isValid: true, value: value }
                : { isValid: false };
        }
    };
}
exports.tuple = tuple;
function except(validator, invalidator) {
    return {
        __outputType: {},
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
        __outputType: "",
        validate: function (value) {
            return typeof value !== "string" ? { isValid: false } : { value: value, isValid: true };
        }
    };
};
exports.string = string;
function exact(expected) {
    return {
        __outputType: {},
        validate: function (value) {
            return value !== expected ? { isValid: false } : { value: value, isValid: true };
        }
    };
}
exports.exact = exact;
var number = function () { return ({
    __outputType: 0,
    validate: function (value) {
        return typeof value !== "number" ? { isValid: false } : { value: value, isValid: true };
    }
}); };
exports.number = number;
var boolean = function () { return ({
    __outputType: false,
    validate: function (value) {
        return typeof value !== "boolean" ? { isValid: false } : { value: value, isValid: true };
    }
}); };
exports.boolean = boolean;
function arrayOf(validator) {
    return {
        __outputType: [],
        validate: function (value) {
            return Array.isArray(value) &&
                value.every(function (value, i) { return validator.validate(value).isValid; })
                ? { value: value, isValid: true }
                : { isValid: false };
        }
    };
}
exports.arrayOf = arrayOf;
function objectOf(validator) {
    return {
        __outputType: {},
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
function object(schema) {
    return {
        __outputType: {},
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
                ? { value: value, isValid: true, __outputType: value }
                : { isValid: false, __outputType: value };
        }
    };
}
exports.object = object;
function any() {
    return {
        __outputType: "",
        validate: function (value) { return ({ isValid: true, value: value }); }
    };
}
exports.any = any;
function lazy(schemaFn) {
    return {
        __outputType: {},
        validate: function (value) { return schemaFn().validate(value); }
    };
}
exports.lazy = lazy;
