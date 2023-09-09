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
exports.validate = exports.fallback = exports.intersection = exports.chain = exports.replaceError = exports.predicate = exports.transform = exports.TransformError = exports.lazy = exports.unknown = exports.any = exports.object = exports.keyOf = exports.KeyNotExistError = exports.ValueIsNullError = exports.ValueIsUndefinedError = exports.objectOf = exports.BadObjectError = exports.arrayOf = exports.ArrayOfInvalidValuesError = exports.boolean = exports.number = exports.exact = exports.string = exports.UnexpectedTypeofError = exports.except = exports.UnexpectedValueError = exports.tuple = exports.exclude = exports.ExcludeError = exports.either = exports.UnexpectedArrayLengthError = exports.NotAnArrayError = exports.TupleError = exports.EitherError = exports.ValidationError = void 0;
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
    function ExcludeError(value, validationResults) {
        var _this = _super.call(this, "Exclude error", "Value includes a value that it shouldn't", value) || this;
        _this.validationResults = validationResults;
        return _this;
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
                error: new ExcludeError("Exclude error", value),
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
            return validations.every(function (validation) { return validation.isValid; })
                ? {
                    isValid: true,
                    value: validations.map(function (v) { return v.isValid && v.value; }),
                }
                : {
                    isValid: false,
                    error: new TupleError(value, validations.filter(function (validation) { return !validation.isValid; })),
                };
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
            return validations.every(function (_a) {
                var isValid = _a.isValid;
                return isValid;
            })
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
                    isValid: true,
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
            if (!Object.keys(o).includes(value)) {
                return {
                    isValid: false,
                    error: new KeyNotExistError(value),
                };
            }
            return {
                isValid: true,
                value: value
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
 * @param shape An object containing fields of nothing but validators, each of
 *   which will be used to validate the value's respective fields
 * @returns A validator that will validate an object against the `schema`
 */
function object(shape) {
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
                        .filter(function (_a) {
                        var validation = _a.validation;
                        return !validation.isValid;
                    })
                        .map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {}, _b[key] = validation, _b);
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
function any() {
    return {
        validate: function (value) { return ({ isValid: true, value: value }); },
    };
}
exports.any = any;
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
    },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJGOztHQUVHO0FBQ0g7SUFDUyxtQ0FBSztJQUdiOzs7Ozs7T0FNRztJQUNILHlCQUNRLElBQVksRUFDWixZQUFvQixFQUNwQixLQUFVO1FBSGxCLFlBS0Msa0JBQU0sWUFBWSxDQUFDLFNBQ25CO1FBTE8sVUFBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGtCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLFdBQUssR0FBTCxLQUFLLENBQUs7O0lBR2xCLENBQUM7SUFDRixzQkFBQztBQUFELENBQUMsQUFsQkQsQ0FDUyxLQUFLLEdBaUJiO0FBbEJxQiwwQ0FBZTtBQW9CckM7SUFBaUMsK0JBQWU7SUFDL0MscUJBQVksS0FBVSxFQUFTLGlCQUEwQztRQUF6RSxZQUNDLGtCQUNDLGNBQWMsRUFDZCxrRUFBa0UsRUFDbEUsS0FBSyxDQUNMLFNBQ0Q7UUFOOEIsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUF5Qjs7SUFNekUsQ0FBQztJQUNGLGtCQUFDO0FBQUQsQ0FBQyxBQVJELENBQWlDLGVBQWUsR0FRL0M7QUFSWSxrQ0FBVztBQVV4QjtJQUFtQyw4QkFBZTtJQUNqRCxvQkFBWSxLQUFZLEVBQVMsaUJBQXdDO1FBQXpFLFlBQ0Msa0JBQ0MsYUFBYSxFQUNiLGlDQUEwQixpQkFBaUIsQ0FBQyxNQUFNLENBQ2pELFVBQUMsVUFBVSxJQUFLLE9BQUEsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFuQixDQUFtQixDQUNuQyxZQUFTLEVBQ1YsS0FBSyxDQUNMLFNBQ0Q7UUFSZ0MsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUF1Qjs7SUFRekUsQ0FBQztJQUNGLGlCQUFDO0FBQUQsQ0FBQyxBQVZELENBQW1D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