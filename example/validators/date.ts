import { string, Validator } from "../../lib";

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
    if (!validation.isValid) {
      return { isValid: false };
    }
    const d = new Date(validation.value);
    return isNaN(d.getTime())
      ? { isValid: false }
      : { isValid: true, value: d };
  },
});
