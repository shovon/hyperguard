console.log(
  `${Array(24)
    .fill(0)
    .map(
      (_, i) =>
        `export function alternatives<\n  ${Array(i + 2)
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

export function alternatives(...alts: Validator<any>[]): Validator<any> {
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
