import {
  chain,
  parser,
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
        parser((value) => new Date(value))
      ),
      (d) => isNaN(d.getTime())
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
//   |> replaceError(%, (value) => new DateError(value))
// ```
