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
exports.lazy = exports.any = exports.object = exports.ValueIsNullError = exports.ValueIsUndefinedError = exports.objectOf = exports.BadObjectError = exports.arrayOf = exports.ArrayOfInvalidValuesError = exports.boolean = exports.number = exports.exact = exports.string = exports.UnexpectedTypeofValue = exports.except = exports.UnexpectedValueError = exports.tuple = exports.either = exports.UnexpectedArrayLengthError = exports.NotAnArrayError = exports.TupleError = exports.EitherError = exports.ValidationError = void 0;
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
                ? { isValid: true, value: value, __: value }
                : {
                    isValid: false,
                    __: value,
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
                ? { isValid: true, value: value }
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
            return validator.validate(value).isValid &&
                !invalidator.validate(value).isValid
                ? { isValid: true, value: value }
                : { isValid: false, error: new UnexpectedValueError(value) };
        }
    };
}
exports.except = except;
function _v(v) {
    return typeof v;
}
var _s = _v({});
var UnexpectedTypeofValue = /** @class */ (function (_super) {
    __extends(UnexpectedTypeofValue, _super);
    function UnexpectedTypeofValue(value, expectedType) {
        var _this = _super.call(this, "Unexpected typeof", "Expected a value of type ".concat(expectedType, ", but got something else"), value) || this;
        _this.expectedType = expectedType;
        return _this;
    }
    return UnexpectedTypeofValue;
}(ValidationError));
exports.UnexpectedTypeofValue = UnexpectedTypeofValue;
/**
 * Creates a validator that determines if the supplied value is a string.
 * @returns A validator to check if the value is of type string
 */
var string = function () {
    return {
        __: "",
        validate: function (value) {
            return typeof value !== "string"
                ? { isValid: false, error: new UnexpectedTypeofValue(value, "string") }
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
            ? { isValid: false, error: new UnexpectedTypeofValue(value, "number") }
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
            ? { isValid: false, error: new UnexpectedTypeofValue(value, "boolean") }
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
                ? { value: value, isValid: true }
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
                    error: new UnexpectedTypeofValue(value, "object")
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
                ? { value: value, isValid: true }
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
function validValidator(value) {
    return value && typeof value.validate === "function"
        ? { valid: true, validator: value }
        : { valid: false };
}
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
                    error: new UnexpectedTypeofValue(value, "object")
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
                ? { value: value, isValid: true }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBCRjs7R0FFRztBQUNIO0lBQ1UsbUNBQUs7SUFRYjs7Ozs7O09BTUc7SUFDSCx5QkFDUyxJQUFZLEVBQ1osWUFBb0IsRUFDcEIsS0FBVTtRQUhuQixZQUtFLGtCQUFNLFlBQVksQ0FBQyxTQUdwQjtRQVBRLFVBQUksR0FBSixJQUFJLENBQVE7UUFDWixrQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixXQUFLLEdBQUwsS0FBSyxDQUFLO1FBSWpCLEtBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQzs7SUFDOUIsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQXpCRCxDQUNVLEtBQUssR0F3QmQ7QUF6QnFCLDBDQUFlO0FBMkJyQztJQUFpQywrQkFBZTtJQUM5QyxxQkFBWSxLQUFVLEVBQVMsaUJBQTBDO1FBQXpFLFlBQ0Usa0JBQ0UsY0FBYyxFQUNkLGtFQUFrRSxFQUNsRSxLQUFLLENBQ04sU0FDRjtRQU44Qix1QkFBaUIsR0FBakIsaUJBQWlCLENBQXlCOztJQU16RSxDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBUkQsQ0FBaUMsZUFBZSxHQVEvQztBQVJZLGtDQUFXO0FBVXhCO0lBQW1DLDhCQUFlO0lBQ2hELG9CQUFZLEtBQVksRUFBUyxpQkFBd0M7UUFBekUsWUFDRSxrQkFDRSxhQUFhLEVBQ2IsaUNBQTBCLGlCQUFpQixDQUFDLE1BQU0sQ0FDaEQsVUFBQyxVQUFVLElBQUssT0FBQSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQW5CLENBQW1CLENBQ3BDLFlBQVMsRUFDVixLQUFLLENBQ04sU0FDRjtRQVJnQyx1QkFBaUIsR0FBakIsaUJBQWlCLENBQXVCOztJQVF6RSxD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