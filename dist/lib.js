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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.fallback = exports.intersection = exports.start = exports.chain = exports.replaceError = exports.predicate = exports.map = exports.TransformError = exports.lazy = exports.unknown = exports.object = exports.keyOf = exports.KeyNotExistError = exports.ValueIsNullError = exports.ValueIsUndefinedError = exports.objectOf = exports.FatalError = exports.BadObjectError = exports.arrayOf = exports.ArrayOfInvalidValuesError = exports.boolean = exports.number = exports.exact = exports.string = exports.UnexpectedTypeofError = exports.except = exports.UnexpectedValueError = exports.tuple = exports.exclude = exports.ExcludeError = exports.either = exports.UnexpectedArrayLengthError = exports.NotAnArrayError = exports.TupleError = exports.EitherError = exports.ValidationError = void 0;
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
                    value: validations.filter(function (v) { return v.isValid; })[0].value,
                }
                : {
                    isValid: false,
                    error: new EitherError(value, validations),
                };
        },
    };
}
exports.either = either;
var ExcludeError = /** @class */ (function (_super) {
    __extends(ExcludeError, _super);
    function ExcludeError(value) {
        return _super.call(this, "Exclude error", "Value includes a value that it shouldn't", value) || this;
    }
    return ExcludeError;
}(ValidationError));
exports.ExcludeError = ExcludeError;
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
function exclude(a, b) {
    return {
        validate: function (value) {
            var aValidation = a.validate(value);
            var bValidation = b.validate(value);
            if (aValidation.isValid && !bValidation.isValid) {
                return {
                    isValid: true,
                    value: aValidation.value,
                };
            }
            return {
                isValid: false,
                error: new ExcludeError(value),
            };
        },
    };
}
exports.exclude = exclude;
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
                    error: new NotAnArrayError(value),
                };
            }
            if (t.length !== value.length) {
                return {
                    isValid: false,
                    error: new UnexpectedArrayLengthError(value, t.length),
                };
            }
            var validations = t.map(function (validator, i) { return validator.validate(value[i]); });
            return (validations.every(function (validation) { return validation.isValid; })
                ? {
                    isValid: true,
                    value: validations.map(function (v) { return v.isValid && v.value; }),
                }
                : {
                    isValid: false,
                    error: new TupleError(value, validations.filter(function (validation) { return !validation.isValid; })),
                });
        },
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
        },
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
        },
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
        },
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
    },
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
    },
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
            return validations.every(function (validation) { return validation.isValid; })
                ? {
                    value: validations.map(function (validation) { return validation.value; }),
                    isValid: true,
                }
                : {
                    isValid: false,
                    error: new ArrayOfInvalidValuesError(value, validations
                        .map(function (v, i) { return ({ index: i, validation: v }); })
                        .filter(function (_a) {
                        var validation = _a.validation;
                        return !validation.isValid;
                    })),
                };
        },
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
var FatalError = /** @class */ (function (_super) {
    __extends(FatalError, _super);
    function FatalError(value, error) {
        var _this = _super.call(this, "Fatal error", "A fatal error occurred", value) || this;
        _this.error = error;
        return _this;
    }
    return FatalError;
}(ValidationError));
exports.FatalError = FatalError;
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
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (objects_1_1 && !objects_1_1.done && (_a = objects_1.return)) _a.call(objects_1);
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
                    error: new UnexpectedTypeofError(value, "object"),
                };
            }
            var fields = Object.keys(value).map(function (key) { return ({
                key: key,
                validation: validator.validate(value[key]),
            }); });
            return fields.every(function (keyValidation) {
                return keyValidation.validation.isValid;
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
                    isValid: true,
                }
                : {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(function (keyValidation) { return !keyValidation.validation.isValid; })
                        .map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {},
                            _b[key] = validation.error,
                            _b);
                    }))),
                };
        },
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
function objectEntries(o) {
    return Object.entries(o);
}
var KeyNotExistError = /** @class */ (function (_super) {
    __extends(KeyNotExistError, _super);
    function KeyNotExistError(key) {
        var _this = _super.call(this, "Key does not exist in object", "The supplied key ".concat(key, " does not exist in the supplied object"), undefined) || this;
        _this.key = key;
        return _this;
    }
    return KeyNotExistError;
}(ValidationError));
exports.KeyNotExistError = KeyNotExistError;
function keyOf(o) {
    return {
        validate: function (value) {
            if (typeof o !== "object" || o === null) {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(o, "object"),
                };
            }
            if (typeof value !== "string" &&
                typeof value !== "number" &&
                typeof value !== "symbol") {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(value, "string"),
                };
            }
            if (!Object.keys(o).includes(value.toString())) {
                return {
                    isValid: false,
                    error: new KeyNotExistError(value),
                };
            }
            return {
                isValid: true,
                value: value,
            };
        },
    };
}
exports.keyOf = keyOf;
/**
 * Creates a validator for an object, specified by the "schema".
 *
 * Each field in the "schema" is a validator, and each of them will validate
 * values against objects in concern.
 *
 * Note: the resulting validator will not "invalidate" objects that have fields
 * not defined in the shape.
 *
 * If you need such a string cimplementation of the object validator, then let
 * me know, and I will gladly implement it.
 * @param shape An object containing fields of nothing but validators, each of
 *   which will be used to validate the value's respective fields
 * @returns A validator that will validate an object against the `schema`
 */
function object(shape) {
    // type S = {
    // 	[key in keyof V]: Validator<V[key]>;
    // };
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
                    error: new UnexpectedTypeofError(value, "object"),
                };
            }
            var fields = Object.keys(shape).map(function (key) { return ({
                key: key,
                validation: shape[key].validate(value[key]),
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
                    isValid: true,
                }
                : {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(fields
                        .filter(function (keyValidation) { return !keyValidation.validation.isValid; })
                        .map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {}, _b[key] = validation.error, _b);
                    }))),
                };
        },
        get partial() {
            var e_3, _a;
            var partialSchema = {};
            try {
                for (var _b = __values(objectEntries(shape)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], validator = _d[1];
                    partialSchema[key] = either(validator, exact(undefined));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return object(partialSchema);
        },
        shape: shape,
        omit: function () { return object(shape); },
        pick: function () { return object(shape); },
        get required() {
            var e_4, _a;
            var requiredSchema = {};
            try {
                for (var _b = __values(Object.entries(shape)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], validator = _d[1];
                    var k = key;
                    requiredSchema[k] = exclude(validator, either(exact(undefined), exact(null)));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return object(requiredSchema);
        },
    };
}
exports.object = object;
/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
 * @returns A validator that will validate *all* objects
 */
function unknown() {
    return {
        validate: function (value) { return ({ isValid: true, value: value }); },
    };
}
exports.unknown = unknown;
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
        validate: function (value) { return schemaFn().validate(value); },
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
var map = function (validator, fn) { return ({
    validate: function (value) {
        try {
            var validation = validator.validate(value);
            return validation.isValid
                ? { isValid: true, value: fn(validation.value) }
                : validation;
        }
        catch (e) {
            return {
                isValid: false,
                error: new FatalError(value, e),
            };
        }
    },
}); };
exports.map = map;
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
        },
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
        },
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
    },
}); };
exports.chain = chain;
var start = function (validator) { return ({
    validate: validator.validate.bind(validator),
    next: function (v) { return (0, exports.start)((0, exports.chain)(validator, v)); },
}); };
exports.start = start;
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
    },
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
    },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJGOztHQUVHO0FBQ0g7SUFDUyxtQ0FBSztJQUdiOzs7Ozs7T0FNRztJQUNILHlCQUNRLElBQVksRUFDWixZQUFvQixFQUNwQixLQUFjO1FBSHRCLFlBS0Msa0JBQU0sWUFBWSxDQUFDLFNBQ25CO1FBTE8sVUFBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGtCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLFdBQUssR0FBTCxLQUFLLENBQVM7O0lBR3RCLENBQUM7SUFDRixzQkFBQztBQUFELENBQUMsQUFsQkQsQ0FDUyxLQUFLLEdBaUJiO0FBbEJxQiwwQ0FBZTtBQW9CckM7SUFBaUMsK0JBQWU7SUFDL0MscUJBQ0MsS0FBYyxFQUNQLGlCQUE4QztRQUZ0RCxZQUlDLGtCQUNDLGNBQWMsRUFDZCxrRUFBa0UsRUFDbEUsS0FBSyxDQUNMLFNBQ0Q7UUFQTyx1QkFBaUIsR0FBakIsaUJBQWlCLENBQTZCOztJQU90RCxDQUFDO0lBQ0Ysa0JBQUM7QUFBRCxDQUFDLEFBWEQsQ0FBaUMsZUFBZSxHQVcvQztBQVhZLGtDQUFXO0FBYXhCO0lBQW1DLDhCQUFlO0lBQ2pELG9CQUNDLEtBQWdCLEVBQ1QsaUJBQXdDO1FBRmhELFlBSUMsa0JBQ0MsYUFBYSxFQUNiLGlDQUEwQixpQkFBaUIsQ0FBQyxNQUFNLENBQ2pELFVBQUMsVUFBVSxJQUFLLE9BQUEsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFuQixDQUFtQixDQUNuQyxZQUFTLEVBQ1YsS0FBSyxDQUNMLFNBQ0Q7UUFUTyx1QkFBaUIsR0FBakIsaUJBQWlCLENBQXVCOztJQVNoRCxDQUFDO0lBQ0YsaUJBQUM7QUFBRCxDQUFDLEFBYkQsQ0FBbUMs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