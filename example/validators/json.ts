import { any, chain, parser, Validator } from "../../lib";

export const json = <T>(validator: Validator<T> = any()) =>
  chain(parser(JSON.parse), validator);
