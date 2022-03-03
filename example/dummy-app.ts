import { parseJSON } from "./json";
import { Event, eventSchema } from "./events/Event";
import { UserJoined } from "./events/UserJoined";
import { ApplicationState } from "./events/ApplicationState";
import { UserLeftMessage } from "./events/UserLeft";

const ws = new WebSocket("https://example.com/path/to/nowhere");

function handleUserJoined(value: UserJoined) {}
function handleApplicationState(value: ApplicationState) {}
function handleUserLeft(value: UserLeftMessage) {}

function handleMessage(value: Event) {
  switch (value.type) {
    case "USER_JOINED":
      handleUserJoined(value);
      break;
    case "APPLICATION_STATE":
      handleApplicationState(value);
      break;
    case "USER_LEFT":
      handleUserLeft(value);
      break;
    case "USER_MESSAGE":
      break;
    default:
      // Fun fact: in TypeScript, if there weren't any
      console.error(
        `Unknown message type. Full message payload in JSON: ${JSON.stringify(
          value,
          null,
          2
        )}`,
        value
      );
      break;
  }
}

function handleValidJSON(value: any) {
  const result = eventSchema.validate(value);
  if (result.isValid) {
    handleMessage(result.value);
  }
}

ws.addEventListener("message", ({ data }) => {
  const result = parseJSON(data);
  if (result.isValid) {
    handleValidJSON(result.value);
  }
});
