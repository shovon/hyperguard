import { string, Validator } from "../../lib";

export const date = (): Validator<Date> => ({
  __outputType: new Date(),
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
