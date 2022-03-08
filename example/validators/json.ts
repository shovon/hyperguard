import { any, chain, transform, Validator } from "../../lib";

export const json = <T>(validator: Validator<T> = any()) =>
  chain(transform(JSON.parse), validator);
