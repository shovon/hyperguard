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
  chain(
    string(),
    replaceError(
      predicate(
        parser((value) => new Date(value)),
        (d) => isNaN(d.getTime())
      ),
      (value) => new DateError(value)
    )
  );
