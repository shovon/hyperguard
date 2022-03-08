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
exports.fallback = exports.chain = exports.replaceError = exports.predicate = exports.transform = exports.TransformError = exports.lazy = exports.any = exports.object = exports.ValueIsNullError = exports.ValueIsUndefinedError = exports.objectOf = exports.BadObjectError = exports.arrayOf = exports.ArrayOfInvalidValuesError = exports.boolean = exports.number = exports.exact = exports.string = exports.UnexpectedTypeofError = exports.except = exports.UnexpectedValueError = exports.tuple = exports.either = exports.UnexpectedArrayLengthError = exports.NotAnArrayError = exports.TupleError = exports.EitherError = exports.ValidationError = void 0;
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
        _this.fullStack = _this.stack;
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
        __: {},
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
        __: {},
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
                ? { isValid: true, value: validations.map(function (v) { return v.isValid && v.value; }) }
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
        __: {},
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
        __: "",
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
        __: {},
        validate: function (value) {
            return value !== expected
                ? { isValid: false, error: new NotExactValueError(value, expected) }
                : { value: value, isValid: true };
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
    __: false,
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
        __: [],
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
        __: {},
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
        __: {},
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
    __: {},
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
        __: {},
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
        __: {},
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
    __: {},
    validate: function (value) {
        var validation = left.validate(value);
        return validation.isValid === false
            ? { isValid: false, error: validation.error }
            : right.validate(validation.value);
    }
}); };
exports.chain = chain;
/**
 * Creates a validator that can fallback to another value.
 * @param validator The validator that, if failed, will need a fallback
 * @param getFallback The function to acquire the fallback value
 * @returns A validator that should never be invalid
 */
var fallback = function (validator, getFallback) { return ({
    __: {},
    validate: function (value) {
        var validation = validator.validate(value);
        return validation.isValid === false
            ? { isValid: true, value: getFallback() }
            : validation;
    }
}); };
exports.fallback = fallback;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJGOztHQUVHO0FBQ0g7SUFDVSxtQ0FBSztJQVFiOzs7Ozs7T0FNRztJQUNILHlCQUNTLElBQVksRUFDWixZQUFvQixFQUNwQixLQUFVO1FBSG5CLFlBS0Usa0JBQU0sWUFBWSxDQUFDLFNBR3BCO1FBUFEsVUFBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGtCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLFdBQUssR0FBTCxLQUFLLENBQUs7UUFJakIsS0FBSSxDQUFDLFNBQVMsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDOztJQUM5QixDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBekJELENBQ1UsS0FBSyxHQXdCZDtBQXpCcUIsMENBQWU7QUEyQnJDO0lBQWlDLCtCQUFlO0lBQzlDLHFCQUFZLEtBQVUsRUFBUyxpQkFBMEM7UUFBekUsWUFDRSxrQkFDRSxjQUFjLEVBQ2Qsa0VBQWtFLEVBQ2xFLEtBQUssQ0FDTixTQUNGO1FBTjhCLHVCQUFpQixHQUFqQixpQkFBaUIsQ0FBeUI7O0lBTXpFLENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMsQUFSRCxDQUFpQyxlQUFlLEdBUS9DO0FBUlksa0NBQVc7QUFVeEI7SUFBbUMsOEJBQWU7SUFDaEQsb0JBQVksS0FBWSxFQUFTLGlCQUF3QztRQUF6RSxZQUNFLGtCQUNFLGFBQWEsRUFDYixpQ0FBMEIsaUJBQWlCLENBQUMsTUFBTSxDQUNoRCxVQUFDLFVBQVUsSUFBSyxPQUFBLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBbkIsQ0FBbUIsQ0FDcEMsWUFBUyxFQUNWLEtBQUssQ0FDTixTQUNGO1FBUmdDLHVCQUFpQixHQUFqQixpQkFBaUIsQ0FB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