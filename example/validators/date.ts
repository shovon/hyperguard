import {
  chain,
  transform,
  predicate,
  replaceError,
  string,
  ValidationError,
} from "../../lib";

class DateError extends ValidationError {
  constructor(value: string) {
    super(
      "Date error",
      `The supplied string ${value} was not a valid format that can be parsed into a Date`,
      value
    );
  }
}

export const date = () =>
  replaceError(
    predicate(
      chain(
        string(),
        transform((value) => new Date(value))
      ),
      (d) => !isNaN(d.getTime())
    ),
    (value) => new DateError(value)
  );

// Had the above used TC39's proposed pipeline operator, then it could have been
// writen as:
//
// ```typescript
// string()
//   |> chain(%, parser(value => new Date(value)))
//   |> predicate(%, value => isNaN(d.getTime()))
//   |> replaceError(%, value => new DateError(value))
// ```
//
// With athat said, you can still achieve a semantic similar to the above by
// using temporary variables.
// ```typescript
// const s = string();
// const c = chain(s, parser((value) => new Date(value)));
// const p = predicate<Date>(c, (d) => isNaN(d.getTime()));
// const r = replaceError(p, (value) => new DateError(value));
// ```
// But that just looks ugly, honestly.
//
// Let's hope that the TC39 hurries up!
