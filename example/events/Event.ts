import { either, InferType } from "../../lib";
import { applicationStateSchema } from "./ApplicationState";
import { userMessageSchema } from "./UserMessage";
import { userJoinedSchema } from "./UserJoined";
import { userLeftMessageSchema } from "./UserLeft";

export const eventSchema = either(
  applicationStateSchema,
  userJoinedSchema,
  userLeftMessageSchema,
  userMessageSchema
);

export type Event = InferType<typeof eventSchema>;
