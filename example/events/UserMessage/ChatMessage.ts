import { exact, InferType, object, string } from "../../../lib";

export const chatMessageSchema = object({
  type: exact("CHAT_MESSAGE"),
  data: object({
    messageBody: string(),
  }),
});

export type ChatMessage = InferType<typeof chatMessageSchema>;
