import { object, exact, string, InferType } from "../../lib";

export const userLeftMessageSchema = object({
  type: exact("USER_LEFT"),
  data: object({
    id: string(),
  }),
});

export type UserLeftMessage = InferType<typeof userLeftMessageSchema>;
