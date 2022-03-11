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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
exports.validate = exports.fallback = exports.intersection = exports.chain = exports.replaceError = exports.predicate = exports.transform = exports.TransformError = exports.lazy = exports.any = exports.object = exports.ValueIsNullError = exports.ValueIsUndefinedError = exports.objectOf = exports.BadObjectError = exports.arrayOf = exports.ArrayOfInvalidValuesError = exports.boolean = exports.number = exports.exact = exports.string = exports.UnexpectedTypeofError = exports.except = exports.UnexpectedValueError = exports.tuple = exports.either = exports.UnexpectedArrayLengthError = exports.NotAnArrayError = exports.TupleError = exports.EitherError = exports.ValidationError = void 0;
/**
 * A base abstract class that represents a generic validation error.
 */
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    /**
     *
     * @param type A string representing what type of validation error that the
     *   error represents
     * @param errorMessage Some detail regarding the nature of the error
     * @param value The original value that triggered the validation error
     */
    function ValidationError(type, errorMessage, value) {
        var _this = _super.call(this, errorMessage) || this;
        _this.type = type;
        _this.errorMessage = errorMessage;
        _this.value = value;
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
var EitherError = /** @class */ (function (_super) {
    __extends(EitherError, _super);
    function EitherError(value, validationResults) {
        var _this = _super.call(this, "Either error", "The provided value does not match any of the possible validators", value) || this;
        _this.validationResults = validationResults;
        return _this;
    }
    return EitherError;
}(ValidationError));
exports.EitherError = EitherError;
var TupleError = /** @class */ (function (_super) {
    __extends(TupleError, _super);
    function TupleError(value, validationResults) {
        var _this = _super.call(this, "Tuple error", "The supplied tuple had ".concat(validationResults.filter(function (validation) { return !validation.isValid; }), " issues"), value) || this;
        _this.validationResults = validationResults;
        return _this;
    }
    return TupleError;
}(ValidationError));
exports.TupleError = TupleError;
var NotAnArrayError = /** @class */ (function (_super) {
    __extends(NotAnArrayError, _super);
    function NotAnArrayError(value) {
        return _super.call(this, "Not an array error", "Expected an array, but instead got something else", value) || this;
    }
    return NotAnArrayError;
}(ValidationError));
exports.NotAnArrayError = NotAnArrayError;
var UnexpectedArrayLengthError = /** @class */ (function (_super) {
    __extends(UnexpectedArrayLengthError, _super);
    function UnexpectedArrayLengthError(value, expectedLength) {
        var _this = _super.call(this, "Unexpected array length error", "Expected an array of length ".concat(expectedLength, " but instead got ").concat(value.length), value) || this;
        _this.expectedLength = expectedLength;
        return _this;
    }
    return UnexpectedArrayLengthError;
}(ValidationError));
exports.UnexpectedArrayLengthError = UnexpectedArrayLengthError;
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
        validate: function (value) {
            var validations = alts.map(function (validator) { return validator.validate(value); });
            return validations.some(function (validation) { return validation.isValid; })
                ? {
                    isValid: true,
                    value: validations.filter(function (v) { return v.isValid; })[0].value
                }
                : {
                    isValid: false,
                    error: new EitherError(value, validations)
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
        validate: function (value) {
            if (!Array.isArray(value)) {
                return {
                    isValid: false,
                    error: new NotAnArrayError(value)
                };
            }
            if (t.length !== value.length) {
                return {
                    isValid: false,
                    error: new UnexpectedArrayLengthError(value, t.length)
                };
            }
            var validations = t.map(function (validator, i) { return validator.validate(value[i]); });
            return validations.every(function (validation) { return validation.isValid; })
                ? {
                    isValid: true,
                    value: validations.map(function (v) { return v.isValid && v.value; })
                }
                : {
                    isValid: false,
                    error: new TupleError(value, validations.filter(function (validation) { return !validation.isValid; }))
                };
        }
    };
}
exports.tuple = tuple;
var UnexpectedValueError = /** @class */ (function (_super) {
    __extends(UnexpectedValueError, _super);
    function UnexpectedValueError(value) {
        return _super.call(this, "Unexpected value error", "The supplied value is not allowed", value) || this;
    }
    return UnexpectedValueError;
}(ValidationError));
exports.UnexpectedValueError = UnexpectedValueError;
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
function except(validator, invalidator) {
    return {
        validate: function (value) {
            var validation = validator.validate(value);
            if (validation.isValid === false) {
                return { isValid: false, error: validation.error };
            }
            return validation.isValid && !invalidator.validate(value).isValid
                ? { isValid: true, value: validation.value }
                : { isValid: false, error: new UnexpectedValueError(value) };
        }
    };
}
exports.except = except;
function _v(v) {
    return typeof v;
}
var _s = _v({});
var UnexpectedTypeofError = /** @class */ (function (_super) {
    __extends(UnexpectedTypeofError, _super);
    function UnexpectedTypeofError(value, expectedType) {
        var _this = _super.call(this, "Unexpected typeof", "Expected a value of type ".concat(expectedType, ", but got something else"), value) || this;
        _this.expectedType = expectedType;
        return _this;
    }
    return UnexpectedTypeofError;
}(ValidationError));
exports.UnexpectedTypeofError = UnexpectedTypeofError;
/**
 * Creates a validator that determines if the supplied value is a string.
 * @returns A validator to check if the value is of type string
 */
var string = function () {
    return {
        validate: function (value) {
            return typeof value !== "string"
                ? { isValid: false, error: new UnexpectedTypeofError(value, "string") }
                : { value: value, isValid: true };
        }
    };
};
exports.string = string;
var NotExactValueError = /** @class */ (function (_super) {
    __extends(NotExactValueError, _super);
    function NotExactValueError(value, expectedValue) {
        var _this = _super.call(this, "Incorrect value", "Expected the value to equal exactly ".concat(expectedValue, " but instead got something else"), value) || this;
        _this.expectedValue = expectedValue;
        return _this;
    }
    return NotExactValueError;
}(ValidationError));
/**
 * Creates a validator that validates values that match the expected value
 * exactly.
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
function exact(expected) {
    return {
        validate: function (value) {
            return Object.is(value, expected)
                ? { value: value, isValid: true }
                : { isValid: false, error: new NotExactValueError(value, expected) };
        }
    };
}
exports.exact = exact;
/**
 * Creates a validator that determines if the supplied value is a number.
 * @returns A validator to check if the value is of type number
 */
var number = function () { return ({
    validate: function (value) {
        return typeof value !== "number"
            ? { isValid: false, error: new UnexpectedTypeofError(value, "number") }
            : { value: value, isValid: true };
    }
}); };
exports.number = number;
/**
 * Creates a validator that determines if the supplied value is a boolean.
 * @returns A validator to check if the value is of type boolean
 */
var boolean = function () { return ({
    validate: function (value) {
        return typeof value !== "boolean"
            ? { isValid: false, error: new UnexpectedTypeofError(value, "boolean") }
            : { value: value, isValid: true };
    }
}); };
exports.boolean = boolean;
var ArrayOfInvalidValuesError = /** @class */ (function (_super) {
    __extends(ArrayOfInvalidValuesError, _super);
    function ArrayOfInvalidValuesError(value, errors) {
        var _this = _super.call(this, "Array of invalid values", "".concat(errors.length, " of the ").concat(value.length, " are invalid"), value) || this;
        _this.badValues = errors;
        return _this;
    }
    return ArrayOfInvalidValuesError;
}(ValidationError));
exports.ArrayOfInvalidValuesError = ArrayOfInvalidValuesError;
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
        validate: function (value) {
            if (!Array.isArray(value)) {
                return { isValid: false, error: new NotAnArrayError(value) };
            }
            var validations = value.map(function (v) { return validator.validate(v); });
            return validations.every(function (_a) {
                var isValid = _a.isValid;
                return isValid;
            })
                ? {
                    value: validations.map(function (validation) { return validation.value; }),
                    isValid: true
                }
                : {
                    isValid: false,
                    error: new ArrayOfInvalidValuesError(value, validations
                        .map(function (v, i) { return ({ index: i, validation: v }); })
                        .filter(function (_a) {
                        var validation = _a.validation;
                        return !validation.isValid;
                    }))
                };
        }
    };
}
exports.arrayOf = arrayOf;
var BadObjectError = /** @class */ (function (_super) {
    __extends(BadObjectError, _super);
    function BadObjectError(value, faultyFields) {
        var _this = _super.call(this, "Bad object", "The supplied object had fields that failed to validate", value) || this;
        _this.faultyFields = faultyFields;
        return _this;
    }
    return BadObjectError;
}(ValidationError));
exports.BadObjectError = BadObjectError;
function mergeObjects(objects) {
    var e_1, _a, e_2, _b;
    var result = {};
    try {
        for (var objects_1 = __values(objects), objects_1_1 = objects_1.next(); !objects_1_1.done; objects_1_1 = objects_1.next()) {
            var object_1 = objects_1_1.value;
            try {
                for (var _c = (e_2 = void 0, __values(Object.entries(object_1))), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
                    result[key] = value;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c["return"])) _b.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (objects_1_1 && !objects_1_1.done && (_a = objects_1["return"])) _a.call(objects_1);
        }
        finally { if (e_1) throw e_1.error; }
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
function objectOf(validator) {
    return {
        validate: function (value) {
            if (value === undefined) {
                return { isValid: false, error: new ValueIsUndefinedError() };
            }
            if (value === null) {
                return { isValid: false, error: new ValueIsNullError() };
            }
            if (typeof value !== "object") {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(value, "object")
                };
            }
            var fields = Object.keys(value).map(function (key) { return ({
                key: key,
                validation: validator.validate(value[key])
            }); });
            return fields.every(function (_a) {
                var validation = _a.validation;
                return validation.isValid;
            })
                ? {
                    value: fields
                        .map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {},
                            _b[key] = validation.value,
                            _b);
                    })
                        .reduce(function (prev, next) { return Object.assign(prev, next); }, {}),
                    isValid: true
                }
                : {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(function (_a) {
                        var validation = _a.validation;
                        return !validation.isValid;
                    })
                        .map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {}, _b[key] = validation, _b);
                    })))
                };
        }
    };
}
exports.objectOf = objectOf;
var ValueIsUndefinedError = /** @class */ (function (_super) {
    __extends(ValueIsUndefinedError, _super);
    function ValueIsUndefinedError() {
        return _super.call(this, "Value is undefined", "The supplied value is undefined, when it should have been something else", undefined) || this;
    }
    return ValueIsUndefinedError;
}(ValidationError));
exports.ValueIsUndefinedError = ValueIsUndefinedError;
var ValueIsNullError = /** @class */ (function (_super) {
    __extends(ValueIsNullError, _super);
    function ValueIsNullError() {
        return _super.call(this, "Value is null", "The supplied value is null, when it should have been something else", null) || this;
    }
    return ValueIsNullError;
}(ValidationError));
exports.ValueIsNullError = ValueIsNullError;
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
        validate: function (value) {
            if (value === undefined) {
                return { isValid: false, error: new ValueIsUndefinedError() };
            }
            if (value === null) {
                return { isValid: false, error: new ValueIsNullError() };
            }
            if (typeof value !== "object") {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(value, "object")
                };
            }
            var fields = Object.keys(schema).map(function (key) { return ({
                key: key,
                validation: schema[key].validate(value[key])
            }); });
            return fields.every(function (_a) {
                var validation = _a.validation;
                return validation.isValid;
            })
                ? {
                    value: Object.assign(__assign({}, value), fields
                        .filter(function (_a) {
                        var validation = _a.validation;
                        return !!validation.value;
                    })
                        .map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {},
                            _b[key] = validation.value,
                            _b);
                    })
                        .reduce(function (prev, next) { return Object.assign(prev, next); }, {})),
                    isValid: true
                }
                : {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(function (_a) {
                        var validation = _a.validation;
                        return !validation.isValid;
                    })
                        .map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {}, _b[key] = validation, _b);
                    })))
                };
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
        validate: function (value) { return schemaFn().validate(value); }
    };
}
exports.lazy = lazy;
var TransformError = /** @class */ (function (_super) {
    __extends(TransformError, _super);
    function TransformError(value, errorObject) {
        var _this = _super.call(this, "Parsing error", "Failed to parse the value", value) || this;
        _this.errorObject = errorObject;
        return _this;
    }
    return TransformError;
}(ValidationError));
exports.TransformError = TransformError;
/**
 * Creates a validator that will parse the supplied value
 *
 * @param parse The parser function that will parse the supplied value
 * @returns A validator to validate the value against
 */
var transform = function (parse) { return ({
    validate: function (value) {
        try {
            return { isValid: true, value: parse(value) };
        }
        catch (e) {
            return { isValid: false, error: new TransformError(value, e) };
        }
    }
}); };
exports.transform = transform;
var PredicateError = /** @class */ (function (_super) {
    __extends(PredicateError, _super);
    function PredicateError(value) {
        return _super.call(this, "Predicate failure", "The predicate failed to match", value) || this;
    }
    return PredicateError;
}(ValidationError));
/**
 * A validator creator that also accepts a predicate
 * @param validator The validator to run the predicate against
 * @param pred The predicate to run against the value
 * @returns A Validator, where if the predicate were to fail, it will result in
 *   a failed validation
 */
function predicate(validator, pred) {
    return {
        validate: function (value) {
            var validation = validator.validate(value);
            return validation.isValid === false
                ? validation
                : pred(validation.value)
                    ? { isValid: true, value: validation.value }
                    : { isValid: false, error: new PredicateError(value) };
        }
    };
}
exports.predicate = predicate;
/**
 * A Validator creator that substitutes the error from one validator, to another
 * error for that validator.
 * @param validator The validator for which to have the error substituted
 * @param createError An error function that will return the appropriate error
 *   object
 * @returns A validator
 */
function replaceError(validator, createError) {
    return {
        validate: function (value) {
            var validation = validator.validate(value);
            return validation.isValid === false
                ? { isValid: false, error: createError(value, validation.error) }
                : { isValid: true, value: validation.value };
        }
    };
}
exports.replaceError = replaceError;
/**
 * Chains two validators together.
 * @param left the first validator to validate values against
 * @param right the second validator to validate values against
 * @returns a validator that will validate first against the first validator
 *   then the second validator
 */
var chain = function (left, right) { return ({
    validate: function (value) {
        var validation = left.validate(value);
        return validation.isValid === false
            ? { isValid: false, error: validation.error }
            : right.validate(validation.value);
    }
}); };
exports.chain = chain;
/**
 * Gets the intersection of two validators
 * @param a The first validator to validate the object against
 * @param b The second validator to validate the object against
 * @returns A validator that is the intersection of the types represented by
 *   validators a and b
 */
var intersection = function (a, b) { return ({
    validate: function (value) {
        var validation1 = a.validate(value);
        if (validation1.isValid === false) {
            return { isValid: false, error: validation1.error };
        }
        var validation2 = b.validate(validation1.value);
        return (validation2.isValid === false
            ? { isValid: false, error: validation2.error }
            : { isValid: true, value: validation2.value });
    }
}); };
exports.intersection = intersection;
/**
 * Creates a validator that can fallback to another value.
 * @param validator The validator that, if failed, will need a fallback
 * @param getFallback The function to acquire the fallback value
 * @returns A validator that should never be invalid
 */
var fallback = function (validator, getFallback) { return ({
    validate: function (value) {
        var validation = validator.validate(value);
        return validation.isValid === false
            ? { isValid: true, value: getFallback() }
            : validation;
    }
}); };
exports.fallback = fallback;
/**
 * This function validates and returns the parsed value. If validation failed,
 * it will throw a runtime exception
 * @param validator A validator to run the validation against the supplied value
 * @param value The value to run the validation against
 * @returns The outcome of the validation
 */
var validate = function (validator, value) {
    var result = validator.validate(value);
    if (result.isValid === false) {
        throw result.error;
    }
    return result.value;
};
exports.validate = validate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJGOztHQUVHO0FBQ0g7SUFDVSxtQ0FBSztJQUdiOzs7Ozs7T0FNRztJQUNILHlCQUNTLElBQVksRUFDWixZQUFvQixFQUNwQixLQUFVO1FBSG5CLFlBS0Usa0JBQU0sWUFBWSxDQUFDLFNBQ3BCO1FBTFEsVUFBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGtCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLFdBQUssR0FBTCxLQUFLLENBQUs7O0lBR25CLENBQUM7SUFDSCxzQkFBQztBQUFELENBQUMsQUFsQkQsQ0FDVSxLQUFLLEdBaUJkO0FBbEJxQiwwQ0FBZTtBQW9CckM7SUFBaUMsK0JBQWU7SUFDOUMscUJBQVksS0FBVSxFQUFTLGlCQUEwQztRQUF6RSxZQUNFLGtCQUNFLGNBQWMsRUFDZCxrRUFBa0UsRUFDbEUsS0FBSyxDQUNOLFNBQ0Y7UUFOOEIsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUF5Qjs7SUFNekUsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQVJELENBQWlDLGVBQWUsR0FRL0M7QUFSWSxrQ0FBVztBQVV4QjtJQUFtQyw4QkFBZTtJQUNoRCxvQkFBWSxLQUFZLEVBQVMsaUJBQXdDO1FBQXpFLFlBQ0Usa0JBQ0UsYUFBYSxFQUNiLGlDQUEwQixpQkFBaUIsQ0FBQyxNQUFNLENBQ2hELFVBQUMsVUFBVSxJQUFLLE9BQUEsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFuQixDQUFtQixDQUNwQyxZQUFTLEVBQ1YsS0FBSyxDQUNOLFNBQ0Y7UUFSZ0MsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUF1Qjs7SUFRekUsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQVZELENBQW1D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