import { chain, string, transform, Validator } from "../../lib";

/**
 * Creates a validator that parses a JSON string, then validates the parsed
 * value against the supplied validator.
 *
 * Called without an argument, it accepts any well-formed JSON. Pass a validator
 * to constrain the shape of the parsed result.
 *
 * ## Usage
 *
 * ```typescript
 * import { object, string, number } from "../../lib";
 *
 * const user = json(object({ name: string(), age: number() }));
 *
 * user.validate('{"name":"Ada","age":36}').isValid; // ✅
 * user.validate('{"name":"Ada"}').isValid;          // ❌ missing age
 * user.validate("not json").isValid;                // ❌ parse error
 * user.validate(42).isValid;                        // ❌ not a string
 * ```
 * @param validator The validator to run against the parsed value
 * @returns A validator that parses a JSON string and validates the result
 */
export const json = <T>(validator: Validator<T>): Validator<T> =>
  chain(
    // `transform` validates the input as a string first, so `value` is typed
    // as `string` here — no cast needed — and non-strings are rejected with a
    // clean error rather than throwing inside JSON.parse.
    transform(string(), (value) => JSON.parse(value)),
    validator,
  );
