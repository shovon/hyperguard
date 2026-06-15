"use strict";
/*
Copyright 2026 Salehen Shovon Rahman

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
exports.validate = exports.fallback = exports.intersection = exports.chain = exports.transform = exports.TransformError = exports.KeyNotExistError = exports.ValueIsNullError = exports.ValueIsUndefinedError = exports.BadObjectError = exports.ArrayOfInvalidValuesError = exports.NotAnInstanceError = exports.boolean = exports.number = exports.string = exports.UnexpectedTypeofError = exports.UnexpectedValueError = exports.ExcludedIncludedError = exports.UnexpectedArrayLengthError = exports.NotAnArrayError = exports.TupleError = exports.EitherError = exports.ValidationError = void 0;
exports.either = either;
exports.exclude = exclude;
exports.tuple = tuple;
exports.except = except;
exports.exact = exact;
exports.instance = instance;
exports.arrayOf = arrayOf;
exports.objectOf = objectOf;
exports.object = object;
exports.unknown = unknown;
exports.lazy = lazy;
exports.predicate = predicate;
exports.replaceError = replaceError;
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
/**
 * A validation error raised when a value fails to match any of the validators
 * supplied to {@link either}.
 */
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
/**
 * A validation error raised when one or more elements of a tuple fail to
 * validate against their respective validators in {@link tuple}.
 */
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
/**
 * A validation error raised when a value was expected to be an array but was
 * something else.
 */
var NotAnArrayError = /** @class */ (function (_super) {
    __extends(NotAnArrayError, _super);
    function NotAnArrayError(value) {
        return _super.call(this, "Not an array error", "Expected an array, but instead got something else", value) || this;
    }
    return NotAnArrayError;
}(ValidationError));
exports.NotAnArrayError = NotAnArrayError;
/**
 * A validation error raised when an array's length does not match the length
 * expected by the validator (e.g. a {@link tuple}).
 */
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
var first = function (arr) {
    if (arr.length <= 0)
        throw new Error("Array is empty");
    return arr[0];
};
/**
 * A validator for validating objects against a list of validators.
 *
 * This is especially useful if a possible object has more than one possible
 * valid type.
 *
 * ## Usage
 *
 * ```typescript
 * const stringOrNumber = either(string(), number());
 *
 * stringOrNumber.validate(10).isValid;      // ✅ true
 * stringOrNumber.validate("hello").isValid; // ✅ true
 * stringOrNumber.validate(true).isValid;    // ❌ false
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
                    value: first(validations.filter(function (v) { return v.isValid; })).value,
                }
                : {
                    isValid: false,
                    error: new EitherError(value, validations),
                };
        },
    };
}
/**
 * A validation error raised when a value validates against the excluded
 * validator in {@link exclude}, meaning it includes a value it shouldn't.
 */
var ExcludedIncludedError = /** @class */ (function (_super) {
    __extends(ExcludedIncludedError, _super);
    function ExcludedIncludedError(value, validationResults) {
        var _this = _super.call(this, "Exclude error", "Value includes a value that it shouldn't", value) || this;
        _this.validationResults = validationResults;
        return _this;
    }
    return ExcludedIncludedError;
}(ValidationError));
exports.ExcludedIncludedError = ExcludedIncludedError;
/**
 * A validator that validates if a value does not validate against another
 * validator.
 *
 * Similar to TypeScript's `Exclude` utility type.
 *
 * ## Usage
 *
 * ```typescript
 * const notAdmin = exclude(string(), exact("admin"));
 *
 * notAdmin.validate("hello").isValid; // ✅ true  (a string, not "admin")
 * notAdmin.validate("admin").isValid; // ❌ false (excluded value)
 * notAdmin.validate(42).isValid;      // ❌ false (not a string)
 * ```
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
            if (!aValidation.isValid) {
                return {
                    isValid: false,
                    error: aValidation.error,
                };
            }
            var isNotT = function (val) {
                return !bValidation.isValid;
            };
            if (isNotT(aValidation.value)) {
                return {
                    isValid: true,
                    value: aValidation.value,
                };
            }
            return {
                isValid: false,
                error: new ExcludedIncludedError("Exclude error", bValidation),
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
 * const tup = tuple([string(), number()]);
 *
 * tup.validate(["a", 1]).isValid; // ✅ true
 * tup.validate([1, "a"]).isValid; // ❌ false (wrong order)
 * tup.validate([1]).isValid;      // ❌ false (wrong length)
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
            var allValid = function (results) {
                return results.every(function (validation) { return validation.isValid; });
            };
            if (!allValid(validations)) {
                return {
                    isValid: false,
                    error: new TupleError(value, validations.filter(function (validation) { return !validation.isValid; })),
                };
            }
            // Return the validated (and possibly transformed) values rather than the
            // raw input, so per-element transforms are carried through. The `.map`
            // erases the positional tuple types, so we reassert the tuple shape here.
            return {
                isValid: true,
                value: validations.map(function (validation) { return validation.value; }),
            };
        },
    };
}
/**
 * A validation error raised when a value matches a validator that was supposed
 * to reject it (e.g. the invalidator in {@link except}).
 */
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
 * ## Usage
 *
 * ```typescript
 * const everythingBut = except(string(), exact("but"));
 *
 * everythingBut.validate("apples").isValid; // ✅ true
 * everythingBut.validate("cherries").isValid; // ✅ true
 * everythingBut.validate("but").isValid; // ❌ false (the excluded value)
 * everythingBut.validate(42).isValid; // ❌ false (not a string)
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
function _v(v) {
    return typeof v;
}
var _s = _v({});
/**
 * A validation error raised when the `typeof` a value does not match the
 * expected type.
 */
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
 *
 * ## Usage
 *
 * ```typescript
 * const str = string();
 *
 * str.validate("hello").isValid; // ✅ true
 * str.validate(42).isValid;      // ❌ false
 * ```
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
 *
 * ## Usage
 *
 * ```typescript
 * const yes = exact("yes");
 *
 * yes.validate("yes").isValid; // ✅ true
 * yes.validate("no").isValid;  // ❌ false
 * ```
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
function exact(expected) {
    return {
        validate: function (value) {
            var is = function (v, expected) {
                return Object.is(value, expected);
            };
            return is(value, expected)
                ? { value: value, isValid: true }
                : { isValid: false, error: new NotExactValueError(value, expected) };
        },
    };
}
/**
 * Creates a validator that determines if the supplied value is a number.
 *
 * ## Usage
 *
 * ```typescript
 * const num = number();
 *
 * num.validate(42).isValid;      // ✅ true
 * num.validate("42").isValid;    // ❌ false
 * ```
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
 *
 * ## Usage
 *
 * ```typescript
 * const bool = boolean();
 *
 * bool.validate(true).isValid;  // ✅ true
 * bool.validate("true").isValid; // ❌ false
 * ```
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
/**
 * A validation error raised when a value is not an instance of the constructor
 * expected by {@link instance}.
 */
var NotAnInstanceError = /** @class */ (function (_super) {
    __extends(NotAnInstanceError, _super);
    function NotAnInstanceError(value, expectedConstructor) {
        var _this = _super.call(this, "Not an instance error", "Expected an instance of ".concat(expectedConstructor.name, ", but got something else"), value) || this;
        _this.expectedConstructor = expectedConstructor;
        return _this;
    }
    return NotAnInstanceError;
}(ValidationError));
exports.NotAnInstanceError = NotAnInstanceError;
/**
 * Creates a validator that determines if the supplied value is an instance of
 * the given constructor (i.e. `value instanceof constructor`).
 *
 * ## Usage
 *
 * ```typescript
 * const dateValidator = instance(Date);
 *
 * dateValidator.validate(new Date()).isValid; // ✅
 * dateValidator.validate("2026-06-14").isValid; // ❌
 * ```
 * @param constructor The constructor to check the value against
 * @returns A validator that checks if the value is an instance of `constructor`
 */
function instance(constructor) {
    return {
        validate: function (value) {
            return value instanceof constructor
                ? { isValid: true, value: value }
                : { isValid: false, error: new NotAnInstanceError(value, constructor) };
        },
    };
}
/**
 * A validation error raised when one or more elements of an array fail to
 * validate in {@link arrayOf}, collecting each offending element and its index.
 */
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
 *
 * ## Usage
 *
 * ```typescript
 * const numbers = arrayOf(number());
 *
 * numbers.validate([1, 2, 3]).isValid;   // ✅ true
 * numbers.validate([1, "2", 3]).isValid; // ❌ false (a non-number element)
 * numbers.validate("nope").isValid;      // ❌ false (not an array)
 * ```
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
/**
 * A validation error raised when one or more fields of an object fail to
 * validate (in {@link object} or {@link objectOf}), keyed by field name.
 */
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
 *
 * ## Usage
 *
 * ```typescript
 * // An object used as a string-keyed map of numbers.
 * const scores = objectOf(number());
 *
 * scores.validate({ alice: 10, bob: 20 }).isValid; // ✅ true
 * scores.validate({ alice: 10, bob: "20" }).isValid; // ❌ false (a non-number field)
 * ```
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
            if (typeof value !== "object") {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(value, "object"),
                };
            }
            if (value === null) {
                return { isValid: false, error: new ValueIsNullError() };
            }
            var fields = Object.entries(value).map(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return ({
                    key: k,
                    validation: validator.validate(v),
                });
            });
            if (fields.every(function (fAndV) {
                return fAndV.validation.isValid;
            })) {
                return {
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
                };
            }
            var validationsOnly = fields
                .filter(function (fAndV) {
                return !fAndV.validation.isValid;
            })
                .map(function (_a) {
                var _b;
                var key = _a.key, validation = _a.validation;
                return (_b = {}, _b[key] = validation.error, _b);
            });
            return {
                isValid: false,
                error: new BadObjectError(value, mergeObjects(validationsOnly)),
            };
        },
    };
}
/**
 * A validation error raised when a value is `undefined` but was expected to be
 * something else.
 */
var ValueIsUndefinedError = /** @class */ (function (_super) {
    __extends(ValueIsUndefinedError, _super);
    function ValueIsUndefinedError() {
        return _super.call(this, "Value is undefined", "The supplied value is undefined, when it should have been something else", undefined) || this;
    }
    return ValueIsUndefinedError;
}(ValidationError));
exports.ValueIsUndefinedError = ValueIsUndefinedError;
/**
 * A validation error raised when a value is `null` but was expected to be
 * something else.
 */
var ValueIsNullError = /** @class */ (function (_super) {
    __extends(ValueIsNullError, _super);
    function ValueIsNullError() {
        return _super.call(this, "Value is null", "The supplied value is null, when it should have been something else", null) || this;
    }
    return ValueIsNullError;
}(ValidationError));
exports.ValueIsNullError = ValueIsNullError;
/**
 * A validation error raised when a referenced key does not exist on the
 * supplied object.
 */
var KeyNotExistError = /** @class */ (function (_super) {
    __extends(KeyNotExistError, _super);
    function KeyNotExistError(_key) {
        var _this = _super.call(this, "Key does not exist in object", "The supplied key ".concat(_key, " does not exist in the supplied object"), undefined) || this;
        _this._key = _key;
        return _this;
    }
    Object.defineProperty(KeyNotExistError.prototype, "key", {
        get: function () {
            return this._key;
        },
        enumerable: false,
        configurable: true
    });
    return KeyNotExistError;
}(ValidationError));
exports.KeyNotExistError = KeyNotExistError;
var isRecord = function (value) {
    return typeof value === "object" && value != null;
};
function mapValues(obj, fn) {
    var has = function (key) {
        return Object.hasOwn(obj, key);
    };
    var isIn = function (key, value) {
        return has(key);
    };
    return Object.fromEntries(Object.entries(obj).map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        if (!has(k))
            throw new Error("An unknown error occurred");
        if (!isIn(k, v))
            throw new Error("An unknown error occurred");
        return [k, fn(v, k)];
    }));
}
/**
 * Creates a validator for an object, specified by the "schema".
 *
 * Each field in the "schema" is a validator, and each of them will validate
 * values against objects in concern.
 *
 * ## Usage
 *
 * ```typescript
 * const user = object({
 *   name: string(),
 *   age: number(),
 * });
 *
 * user.validate({ name: "Ada", age: 36 }).isValid; // ✅ true
 * user.validate({ name: "Ada" }).isValid;          // ❌ false (missing age)
 * user.validate({ name: "Ada", age: "36" }).isValid; // ❌ false (age not a number)
 * ```
 * @param shape An object containing fields of nothing but validators, each of
 *   which will be used to validate the value's respective fields
 * @returns A validator that will validate an object against the `schema`
 */
function object(shape) {
    return {
        get shape() {
            return shape;
        },
        validate: function (value) {
            // Process of elimination. Check if undefined. If yes, invalid.
            if (value === undefined) {
                return { isValid: false, error: new ValueIsUndefinedError() };
            }
            // Otherwise, not undefined, therefore continue.
            // Check if object. If not, invalid.
            if (!isRecord(value)) {
                return {
                    isValid: false,
                    error: new UnexpectedTypeofError(value, "object"),
                };
            }
            // Type-assert fields by key and validation result (effectively, rather
            // than an array of key value pairs, instead, it's an array of key and
            // validation result).
            var fields = Object.entries(shape).map(function (_a) {
                var _b = __read(_a, 2), key = _b[0], validator = _b[1];
                return ({
                    key: key,
                    validation: validator.validate(value[key]),
                });
            });
            var onlyBadFields = fields.filter(function (keyValidation) {
                return !keyValidation.validation.isValid;
            });
            var f = fields;
            var onlyGoodFields = f.filter(function (keyValidation) {
                return keyValidation.validation.isValid;
            });
            if (!fields.every(function (f) { return f.validation.isValid; })) {
                return {
                    isValid: false,
                    error: new BadObjectError(value, mergeObjects(onlyBadFields.map(function (_a) {
                        var _b;
                        var key = _a.key, validation = _a.validation;
                        return (_b = {},
                            _b[key] = validation.error,
                            _b);
                    }))),
                };
            }
            return {
                value: Object.assign(__assign({}, value), onlyGoodFields
                    // Only write back keys that were actually present in the input.
                    // A field absent from the input but optional in the schema
                    // validates (as `undefined`) without us materializing a spurious
                    // `key: undefined` entry on the result.
                    .filter(function (_a) {
                    var key = _a.key;
                    return Object.hasOwn(value, key);
                })
                    .map(function (_a) {
                    var _b;
                    var key = _a.key, validation = _a.validation;
                    return _b = {},
                        _b[key] = validation.value,
                        _b;
                })
                    .reduce(function (prev, next) { return Object.assign(prev, next); }, {})),
                isValid: true,
            };
        },
        get partial() {
            return object(mapValues(shape, function (v) { return either(v, exact(undefined)); }));
        },
        omit: function () { return object(shape); },
        pick: function () { return object(shape); },
        get required() {
            return object(mapValues(shape, function (v) {
                return exclude(v, exact(undefined));
            }));
        },
    };
}
/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
 *
 * ## Usage
 *
 * ```typescript
 * const anything = unknown();
 *
 * anything.validate(42).isValid;      // ✅ true
 * anything.validate("hi").isValid;    // ✅ true
 * anything.validate(null).isValid;    // ✅ true
 * ```
 * @returns A validator that will validate *all* objects
 */
function unknown() {
    return {
        validate: function (value) { return ({ isValid: true, value: value }); },
    };
}
/**
 * Creates a validator that lazily evaluates the callback, at every validation.
 *
 * Useful for recursive types, such as a node for a tree.
 *
 * ## Usage
 *
 * ```typescript
 * type Tree = { value: number; children: Tree[] };
 *
 * // `lazy` defers referencing `tree` until validation time, so the validator
 * // can refer to itself.
 * const tree: Validator<Tree> = object({
 *   value: number(),
 *   children: lazy(() => arrayOf(tree)),
 * });
 *
 * tree.validate({ value: 1, children: [{ value: 2, children: [] }] }).isValid; // ✅ true
 * ```
 * @param schemaFn A function that returns a validator
 * @returns A validator, effectively just a "forwarding" of the validator
 *   returned by the `schemaFn`
 */
function lazy(schemaFn) {
    return {
        validate: function (value) { return schemaFn().validate(value); },
    };
}
/**
 * A validation error raised when a {@link transform} parser throws, wrapping the
 * thrown error in `errorObject`.
 */
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
 * Creates a validator that first validates the supplied value against
 * `validator`, then maps the validated value through `parse`.
 *
 * Because the input is validated up front, the `parse` callback receives a
 * value already narrowed to the validator's type, rather than `unknown`. To
 * transform an arbitrary value with no prior validation, pass {@link unknown}
 * as the validator.
 *
 * ## Usage
 *
 * ```typescript
 * // `value` is inferred as `string`, so no cast is needed.
 * const toDate = transform(string(), (value) => new Date(value));
 *
 * toDate.validate("1970-01-01T00:00:00.000Z").isValid; // ✅
 * toDate.validate(42).isValid;                          // ❌ not a string
 * ```
 * @param validator The validator the value must satisfy before being parsed
 * @param parse The parser, receiving the validated value
 * @returns A validator that validates then maps the value
 */
var transform = function (validator, parse) { return ({
    validate: function (value) {
        var validation = validator.validate(value);
        if (validation.isValid === false) {
            return validation;
        }
        try {
            return { isValid: true, value: parse(validation.value) };
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
 *
 * ## Usage
 *
 * ```typescript
 * // A string of at least 8 characters. `value` is typed as `string`.
 * const password = predicate(string(), (value) => value.length >= 8);
 *
 * password.validate("hunter2000").isValid; // ✅ true
 * password.validate("short").isValid;      // ❌ false (fails the predicate)
 * password.validate(42).isValid;           // ❌ false (not a string)
 * ```
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
/**
 * A Validator creator that substitutes the error from one validator, to another
 * error for that validator.
 *
 * ## Usage
 *
 * ```typescript
 * class NotAName extends ValidationError {
 *   constructor(value: unknown) {
 *     super("Not a name", "Expected a name string", value);
 *   }
 * }
 *
 * // Same validation as `string()`, but with a custom error on failure.
 * const name = replaceError(string(), (value) => new NotAName(value));
 *
 * name.validate("Ada").isValid; // ✅ true
 * name.validate(42).isValid;    // ❌ false (fails with a NotAName error)
 * ```
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
/**
 * Chains two validators together.
 *
 * The value (possibly transformed) produced by `left` is fed into `right`, so
 * this is how you compose, for example, a parse step with a shape check.
 *
 * ## Usage
 *
 * ```typescript
 * // Validate a string, then constrain it to a minimum length.
 * const nonEmpty = chain(string(), predicate(string(), (s) => s.length > 0));
 *
 * nonEmpty.validate("hi").isValid; // ✅ true
 * nonEmpty.validate("").isValid;   // ❌ false (empty)
 * nonEmpty.validate(42).isValid;   // ❌ false (not a string)
 * ```
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
 *
 * ## Usage
 *
 * ```typescript
 * const named = object({ name: string() });
 * const aged = object({ age: number() });
 *
 * // Must satisfy both shapes: { name: string } & { age: number }.
 * const person = intersection(named, aged);
 *
 * person.validate({ name: "Ada", age: 36 }).isValid; // ✅ true
 * person.validate({ name: "Ada" }).isValid;          // ❌ false (missing age)
 * ```
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
 *
 * ## Usage
 *
 * ```typescript
 * // Use the given number, or default to 0 when the value isn't a number.
 * const count = fallback(number(), () => 0);
 *
 * count.validate(42);    // { isValid: true, value: 42 }
 * count.validate("nope"); // { isValid: true, value: 0 }  (fell back)
 * ```
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
 *
 * ## Usage
 *
 * ```typescript
 * const user = object({ name: string(), age: number() });
 *
 * // Returns the typed value on success...
 * const value = validate(user, { name: "Ada", age: 36 });
 * value.name; // "Ada", typed as string
 *
 * // ...and throws the ValidationError on failure.
 * validate(user, { name: "Ada" }); // throws
 * ```
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMExGLHdCQWlCQztBQWtDRCwwQkFnQ0M7QUFxQkQsc0JBaURDO0FBbUNELHdCQWVDO0FBc0ZELHNCQVVDO0FBMEVELDRCQVNDO0FBdUNELDBCQXlCQztBQW9ERCw0QkE0REM7QUF3SkQsd0JBMkhDO0FBaUJELDBCQUlDO0FBeUJELG9CQUlDO0FBOEVELDhCQWNDO0FBMEJELG9DQVlDO0FBL29DRDs7R0FFRztBQUNIO0lBQ1UsbUNBQUs7SUFPYjs7Ozs7O09BTUc7SUFDSCx5QkFBWSxJQUFZLEVBQUUsWUFBb0IsRUFBRSxLQUFjO1FBQzVELFlBQUEsTUFBSyxZQUFDLFlBQVksQ0FBQyxTQUFDO1FBQ3BCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEtBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOztJQUNyQixDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBckJELENBQ1UsS0FBSyxHQW9CZDtBQXJCcUIsMENBQWU7QUF1QnJDOzs7R0FHRztBQUNIO0lBQWlDLCtCQUFlO0lBRzlDLHFCQUFZLEtBQWMsRUFBRSxpQkFBOEM7UUFDeEUsWUFBQSxNQUFLLFlBQ0gsY0FBYyxFQUNkLGtFQUFrRSxFQUNsRSxLQUFLLENBQ04sU0FBQztRQUNGLEtBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQzs7SUFDN0MsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQVhELENBQWlDLGVBQWUsR0FXL0M7QUFYWSxrQ0FBVztBQWF4Qjs7O0dBR0c7QUFDSDtJQUFtQyw4QkFBZTtJQUdoRCxvQkFBWSxL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