import { any, exact, InferType, object } from "../../lib";
import { date } from "../validators/date";

export const broadcastMessageSchema = object({
  type: exact("BROADCAST_MESSAGE"),
  data: object({
    whenSent: date(),
    data: any(),
  }),
});

export type BroadcastMessage = InferType<typeof broadcastMessageSchema>;
