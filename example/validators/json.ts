import { ValidationError, Validator } from "../../lib";

class JsonParsingFailedError extends ValidationError {
  constructor(value: any, public error: any) {
    super("JSON parsing failed", "Failed to parse the supplied value", value);
  }
}

export const json = (): Validator<any> => ({
  __: {},
  validate: (value: any) => {
    try {
      const result = JSON.parse(value);
      return { isValid: true, value: result };
    } catch (e) {
      return { isValid: false, error: new JsonParsingFailedError(value, e) };
    }
  },
});
