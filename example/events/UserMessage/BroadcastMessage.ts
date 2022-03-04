import { exact, InferType, object } from "../../../lib";
import { date } from "../../validators/date";
import { chatMessageSchema } from "./ChatMessage";

export const broadcastMessageSchema = object({
  type: exact("BROADCAST_MESSAGE"),
  data: object({
    whenSent: date(),
    data: chatMessageSchema,
  }),
});

export type BroadcastMessage = InferType<typeof broadcastMessageSchema>;
