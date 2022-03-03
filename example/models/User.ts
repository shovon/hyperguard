import { string, object, InferType } from "../../lib";

export const userSchema = object({
  id: string(),
  name: string(),
});

export type User = InferType<typeof userSchema>;
