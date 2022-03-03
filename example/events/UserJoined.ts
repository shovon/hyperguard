import { object, exact, InferType } from "../../lib";
import { userSchema } from "../models/User";

export const userJoinedSchema = object({
  type: exact("USER_JOINED"),
  data: userSchema,
});

export type UserJoined = InferType<typeof userJoinedSchema>;
