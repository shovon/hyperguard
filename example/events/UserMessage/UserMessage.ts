import { either, exact, InferType, object, string } from "../../../lib";
import { broadcastMessageSchema } from "./BroadcastMessage";
import { directMessageSchema } from "./DirectMessage";

export const userMessageSchema = object({
  type: exact("USER_MESSAGE"),
  data: object({
    from: string(),
    data: either(broadcastMessageSchema, directMessageSchema),
  }),
});

export type UserMessage = InferType<typeof userMessageSchema>;
