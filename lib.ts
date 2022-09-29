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
 * An object that serves as a validator.
 */
export type Validator<T> = {
	validate: (value: any) => ValidationResult<T>;
};

export type ValidationFailure = { isValid: false; error: IValidationError };
export type ValidationSuccess<T> = { value: T; isValid: true };

/**
 * An object that represents the result of a validation check.
 */
export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

/**
 * An object that represents a validation error.
 */
export type IValidationError = {
	readonly type: string;
	readonly errorMessage: string;
	readonly value: any;
} & { [key: string]: any };

/**
 * A base abstract class that represents a generic validation error.
 */
export abstract class ValidationError
	extends Error
	implements IValidationError
{
	/**
	 *
	 * @param type A string representing what type of validation error that the
	 *   error represents
	 * @param errorMessage Some detail regarding the nature of the error
	 * @param value The original value that triggered the validation error
	 */
	constructor(
		public type: string,
		public errorMessage: string,
		public value: any
	) {
		super(errorMessage);
	}
}

export class EitherError extends ValidationError {
	constructor(value: any, public validationResults: ValidationResult<any>[]) {
		super(
			"Either error",
			"The provided value does not match any of the possible validators",
			value
		);
	}
}

export class TupleError<T> extends ValidationError {
	constructor(value: any[], public validationResults: ValidationResult<T>[]) {
		super(
			"Tuple error",
			`The supplied tuple had ${validationResults.filter(
				(validation) => !validation.isValid
			)} issues`,
			value
		);
	}
}

export class NotAnArrayError extends ValidationError {
	constructor(value: any) {
		super(
			"Not an array error",
			"Expected an array, but instead got something else",
			value
		);
	}
}

export class UnexpectedArrayLengthError extends ValidationError {
	constructor(value: any[], public expectedLength: number) {
		super(
			"Unexpected array length error",
			`Expected an array of length ${expectedLength} but instead got ${value.length}`,
			value
		);
	}
}

/**
 * A helper type for converting a Validator<T> type to a T
 *
 * For example, if you wanted to grab the validator from a `string()`, you'd use
 * this type like so:
 *
 * ```typescript
 * const stringValidator = string();
 *
 * type Str = InferType<typeof stringValidator>;
 * // Should be `type Str = string`
 * ```
 *
 * You can do this with objects as well. For example:
 *
 * ```typescript
 * const objectValidator = object({
 *   name: string(),
 *   email: string(),
 *   age: number()
 * });
 *
 * type Obj = InferType<typeof objectValidator>;
 * // Should be:
 * //
 * // type Obj = {
 * //   name: string
 * //   email: string
 * //   age: number
 * // }
 * ```
 */
export type InferType<V extends Validator<unknown>> = V extends Validator<
	infer T
>
	? T
	: never;

type ValidatorArrayToValidatorUnion<T extends Validator<unknown>[]> =
	T extends Validator<infer I>[] ? Validator<I> : never;

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
export function either<T extends Validator<unknown>[]>(
	...alts: T
): ValidatorArrayToValidatorUnion<T> {
	return {
		validate: (value: any) => {
			const validations = alts.map((validator) => validator.validate(value));
			return validations.some((validation) => validation.isValid)
				? {
						isValid: true,
						value: (validations.filter((v) => v.isValid)[0] as any).value,
				  }
				: {
						isValid: false,
						error: new EitherError(value, validations),
				  };
		},
	} as ValidatorArrayToValidatorUnion<T>;
}

type ValidatorTupleToValueTuple<T extends Validator<unknown>[]> = Validator<{
	[P in keyof T]: T[P] extends Validator<infer U> ? U : never;
}>;

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
export function tuple<T extends Validator<unknown>[]>(
	t: [...T]
): ValidatorTupleToValueTuple<T> {
	return {
		validate: (value: any) => {
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
				? ({
						isValid: true,
						value: validations.map((v) => v.isValid && v.value),
				  } as ValidationResult<any>)
				: {
						isValid: false,
						error: new TupleError(
							value,
							validations.filter((validation) => !validation.isValid)
						),
				  };
		},
	};
}

export class UnexpectedValueError extends ValidationError {
	constructor(value: any) {
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
export function except<T, I>(
	validator: Validator<T>,
	invalidator: Validator<I>
): Validator<Exclude<T, I>> {
	return {
		validate: (value: any) => {
			const validation = validator.validate(value);
			if (validation.isValid === false) {
				return { isValid: false, error: validation.error };
			}
			return validation.isValid && !invalidator.validate(value).isValid
				? { isValid: true, value: validation.value as Exclude<T, I> }
				: { isValid: false, error: new UnexpectedValueError(value) };
		},
	};
}

function _v(v: any) {
	return typeof v;
}

const _s = _v({} as any);

export type PossibleTypeof = typeof _s;

export class UnexpectedTypeofError extends ValidationError {
	constructor(value: any, public expectedType: PossibleTypeof) {
		super(
			"Unexpected typeof",
			`Expected a value of type ${expectedType}, but got something else`,
			value
		);
	}
}

/**
 * Creates a validator that determines if the supplied value is a string.
 * @returns A validator to check if the value is of type string
 */
export const string = (): Validator<string> => {
	return {
		validate: (value: any) =>
			typeof value !== "string"
				? { isValid: false, error: new UnexpectedTypeofError(value, "string") }
				: { value, isValid: true },
	};
};

export type ExactTypes = string | number | boolean | null | undefined;

class NotExactValueError extends ValidationError {
	constructor(value: any, public expectedValue: ExactTypes) {
		super(
			"Incorrect value",
			`Expected the value to equal exactly ${expectedValue} but instead got something else`,
			value
		);
	}
}

/**
 * Creates a validator that validates values that match the expected value
 * exactly.
 * @param expected The exact value to be expected
 * @returns A validator that will only validate values that match exactly the
 *   expected value
 */
export function exact<V extends ExactTypes>(expected: V): Validator<V> {
	return {
		validate: (value: any) =>
			Object.is(value, expected)
				? { value, isValid: true }
				: { isValid: false, error: new NotExactValueError(value, expected) },
	};
}

/**
 * Creates a validator that determines if the supplied value is a number.
 * @returns A validator to check if the value is of type number
 */
export const number = (): Validator<number> => ({
	validate: (value: any) =>
		typeof value !== "number"
			? { isValid: false, error: new UnexpectedTypeofError(value, "number") }
			: { value, isValid: true },
});

/**
 * Creates a validator that determines if the supplied value is a boolean.
 * @returns A validator to check if the value is of type boolean
 */
export const boolean = (): Validator<boolean> => ({
	validate: (value: any) =>
		typeof value !== "boolean"
			? { isValid: false, error: new UnexpectedTypeofError(value, "boolean") }
			: { value, isValid: true },
});

type BadValue<T> = { index: number; validation: ValidationResult<T> };

export class ArrayOfInvalidValuesError<T> extends ValidationError {
	public badValues: BadValue<T>[];

	constructor(value: T[], errors: BadValue<T>[]) {
		super(
			"Array of invalid values",
			`${errors.length} of the ${value.length} are invalid`,
			value
		);
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
export function arrayOf<V>(validator: Validator<V>): Validator<V[]> {
	return {
		validate: (value: any) => {
			if (!Array.isArray(value)) {
				return { isValid: false, error: new NotAnArrayError(value) };
			}
			const validations = value.map((v) => validator.validate(v));
			return validations.every(({ isValid }) => isValid)
				? {
						value: validations.map((validation) => (validation as any).value),
						isValid: true,
				  }
				: {
						isValid: false,
						error: new ArrayOfInvalidValuesError(
							value,
							validations
								.map((v, i) => ({ index: i, validation: v }))
								.filter(({ validation }) => !validation.isValid)
						),
				  };
		},
	};
}

export class BadObjectError extends ValidationError {
	constructor(
		value: any,
		public faultyFields: { [key: string]: ValidationError }
	) {
		super(
			"Bad object",
			"The supplied object had fields that failed to validate",
			value
		);
	}
}

function mergeObjects(objects: { [key: string]: any }[]) {
	const result: { [key: string]: any } = {};
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
export function objectOf<V>(
	validator: Validator<V>
): Validator<{ [keys: string]: V }> {
	return {
		validate: (value: any) => {
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
				? ({
						value: fields
							.map(({ key, validation }) => ({
								[key]: (validation as any).value,
							}))
							.reduce((prev, next) => Object.assign(prev, next), {}),
						isValid: true,
				  } as ValidationResult<{ [key: string]: V }>)
				: {
						isValid: false,
						error: new BadObjectError(
							value,
							mergeObjects(
								fields
									.filter(({ validation }) => !validation.isValid)
									.map(({ key, validation }) => ({ [key]: validation }))
							)
						),
				  };
		},
	};
}

export class ValueIsUndefinedError extends ValidationError {
	constructor() {
		super(
			"Value is undefined",
			"The supplied value is undefined, when it should have been something else",
			undefined
		);
	}
}

export class ValueIsNullError extends ValidationError {
	constructor() {
		super(
			"Value is null",
			"The supplied value is null, when it should have been something else",
			null
		);
	}
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
export function object<V extends object>(schema: {
	[key in keyof V]: Validator<V[key]>;
}): Validator<V> {
	return {
		validate: (value: any) => {
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
			const fields = Object.keys(schema).map((key) => ({
				key,
				validation: ((schema as any)[key] as Validator<any>).validate(
					value[key]
				),
			}));

			return fields.every(({ validation }) => validation.isValid)
				? {
						value: Object.assign(
							{ ...value },
							fields
								.filter(({ validation }) => !!(validation as any).value)
								.map(({ key, validation }) => ({
									[key]: (validation as any).value,
								}))
								.reduce((prev, next) => Object.assign(prev, next), {}) as V
						),
						isValid: true,
				  }
				: {
						isValid: false,
						error: new BadObjectError(
							value,
							mergeObjects(
								fields
									.filter(({ validation }) => !validation.isValid)
									.map(({ key, validation }) => ({ [key]: validation }))
							)
						),
				  };
		},
	};
}

/**
 * Creates a validator that where the validation function will never determine
 * that a value is invalid
 * @returns A validator that will validate *all* objects
 */
export function any(): Validator<any> {
	return {
		validate: (value: any) => ({ isValid: true, value }),
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
export function lazy<V extends any>(
	schemaFn: () => Validator<V>
): Validator<V> {
	return {
		validate: (value: any) => schemaFn().validate(value),
	};
}

export class TransformError extends ValidationError {
	constructor(value: any, public errorObject: any) {
		super("Parsing error", "Failed to parse the value", value);
	}
}

/**
 * Creates a validator that will parse the supplied value
 *
 * @param parse The parser function that will parse the supplied value
 * @returns A validator to validate the value against
 */
export const transform = <T>(parse: (value: any) => T): Validator<T> => ({
	validate(value: any) {
		try {
			return { isValid: true, value: parse(value) };
		} catch (e) {
			return { isValid: false, error: new TransformError(value, e) };
		}
	},
});

class PredicateError extends ValidationError {
	constructor(value: any) {
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
export function predicate<T>(
	validator: Validator<T>,
	pred: (value: T) => boolean
): Validator<T> {
	return {
		validate(value: any): ValidationResult<T> {
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
export function replaceError<T>(
	validator: Validator<T>,
	createError: (value: any, error: IValidationError) => IValidationError
): Validator<T> {
	return {
		validate(value: any) {
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
export const chain = <T1, T2>(
	left: Validator<T1>,
	right: Validator<T2>
): Validator<T2> => ({
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
export const intersection = <T1, T2>(
	a: Validator<T1>,
	b: Validator<T2>
): Validator<T1 & T2> => ({
	validate(value) {
		const validation1 = a.validate(value);
		if (validation1.isValid === false) {
			return { isValid: false, error: validation1.error };
		}
		const validation2 = b.validate(validation1.value);
		return (
			validation2.isValid === false
				? { isValid: false, error: validation2.error }
				: { isValid: true, value: validation2.value }
		) as ValidationResult<T1 & T2>;
	},
});

/**
 * Creates a validator that can fallback to another value.
 * @param validator The validator that, if failed, will need a fallback
 * @param getFallback The function to acquire the fallback value
 * @returns A validator that should never be invalid
 */
export const fallback = <T1, T2>(
	validator: Validator<T1>,
	getFallback: () => T2
): Validator<T1 | T2> => ({
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
export const validate = <T>(validator: Validator<T>, value: any): T => {
	const result = validator.validate(value);
	if (result.isValid === false) {
		throw result.error;
	}
	return result.value;
};
