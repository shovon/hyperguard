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
                    error: new TupleError(value, validations)
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
    function BadObjectError(value, objectSchema) {
        var _this = _super.call(this, "Bad object", "The supplied object had fields that failed to validate", value) || this;
        _this.objectSchema = objectSchema;
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