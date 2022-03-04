import { exact, InferType, object, string } from "../../../lib";
import { date } from "../../validators/date";
import { chatMessageSchema } from "./ChatMessage";

export const directMessageSchema = object({
  type: exact("DIRECT_MESSAGE"),
  data: object({
    to: string(),
    whenSent: date(),
    data: chatMessageSchema,
  }),
});

export type DirectMessage = InferType<typeof directMessageSchema>;
