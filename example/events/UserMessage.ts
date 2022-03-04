import { exact, InferType, object, string } from "../../lib";
import { broadcastMessageSchema } from "./BroadcastMessage";

export const userMessageSchema = object({
  type: exact("USER_MESSAGE"),
  data: object({
    from: string(),
    data: broadcastMessageSchema,
  }),
});

export type Message = InferType<typeof userMessageSchema>;
