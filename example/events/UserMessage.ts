import { any, exact, InferType, object, string } from "../../lib";

export const userMessageSchema = object({
  type: exact("USER_MESSAGE"),
  data: object({
    from: string(),
    data: any(),
  }),
});

export type Message = InferType<typeof userMessageSchema>;
