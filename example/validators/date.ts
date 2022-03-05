import { string, ValidationError, Validator } from "../../lib";

class DateError extends ValidationError {
  constructor(value: string) {
    super(
      "Date error",
      `The supplied string ${value} was not a valid format that can be parsed into a Date`,
      value
    );
  }
}

/**
 * Represents a validator for a string that is supposed to represent a string
 * that can be parsed by the `Date` constructor.
 *
 * The validator itself will represent a `Date` object, and not a string.
 * @returns A Validator that takes a string, and returns a validation result of
 * type `Date`
 */
export const date = (): Validator<Date> => ({
  __: new Date(),
  validate: (value: any) => {
    const validation = string().validate(value);
    if (validation.isValid === false) {
      return { isValid: false, error: validation.error };
    }
    const d = new Date(validation.value);
    return isNaN(d.getTime())
      ? {
          isValid: false,
          error: new DateError(validation.value),
        }
      : { isValid: true, value: d };
  },
});
