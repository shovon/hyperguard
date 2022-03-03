import { exact, object, arrayOf, InferType } from "../../lib";
import { userSchema } from "../models/User";

export const applicationStateSchema = object({
  type: exact("APPLICATION_STATE"),
  data: arrayOf(userSchema),
});

export type ApplicationState = InferType<typeof applicationStateSchema>;
