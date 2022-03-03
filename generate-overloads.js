console.log(
  `${Array(24)
    .fill(0)
    .map(
      (_, i) =>
        `export function either<\n  ${Array(i + 2)
          .fill(0)
          .map((_, i) => `T${i}`)
          .join(",\n  ")}\n>(\n  ${Array(i + 2)
          .fill(0)
          .map((_, i) => `a${i}: Validator<T${i}>`)
          .join(", \n  ")}\n): Validator<\n | ${Array(i + 2)
          .fill(0)
          .map((_, i) => `T${i}`)
          .join("\n | ")}\n>`
    )
    .join(";\n")};

/**
 * A validator for validating objects against a list of validators.
 *
 * This is especially useful if a possible object has more than one possible
 * valid type.
 *
 * ## Usage
 *
 * \`\`\`typescript
 * const alts = either(string(), number());
 *
 * const num = 10;
 * const str = "hello";
 * const bool = true;
 *
 * console.log(alts.validate(num).valid); // Should be true
 * console.log(alts.validate(str).valid); // Should be true
 * console.log(alts.validate(bool).valid); // Should be false
 * \`\`\`
 * @param alts A list of validators that are to be run
 * @returns A validator to validate an object against a set of validators
 */
export function either(...alts: Validator<any>[]): Validator<any> {
  return {
    __outputType: {} as any,
    validate: (value: any) =>
      alts.some((validator) => validator.validate(value).valid)
        ? { valid: true, value, __outputType: value }
        : { valid: false, __outputType: value },
  };
}`
);

console.log(
  `export function tuple(t: []): Validator<[]>;
${Array(24)
  .fill(0)
  .map(
    (_, i) =>
      `export function tuple<\n  ${Array(i + 1)
        .fill(0)
        .map((_, i) => `T${i}`)
        .join(",\n  ")}\n>(t: [\n  ${Array(i + 1)
        .fill(0)
        .map((_, i) => `Validator<T${i}>`)
        .join(", \n  ")}\n]): Validator<[\n  ${Array(i + 1)
        .fill(0)
        .map((_, i) => `T${i}`)
        .join(",  ")}\n]>`
  )
  .join(";\n")};

/**
 * Used to validate a tuple against the individual values in an array.
 *
 * ## Usage
 *
 * \`\`\`typescript
 * const tup = tuple(string(), number());
 *
 * alts.validate(["a", 1]).isValid // will be true
 * alts.validate([1, "a"]).isValid // will be false
 * alts.validate([1]).isValid // will be false
 * \`\`\`
 * @param t The tuple of validators to validate a tuple against
 * @returns A validator to validate tuples
 */
export function tuple(t: any[]): Validator<any[]> {
  return {
    __outputType: {} as any,
    validate: (value: any) =>
      alts.some((validator) => validator.validate(value).valid)
        ? { valid: true, value, __outputType: value }
        : { valid: false, __outputType: value },
  };
}`
);
