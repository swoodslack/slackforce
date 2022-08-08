import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { ConnectFunction } from "./definition.ts";
import { setSettings } from "../../backend/storage.ts";

const connect_function: SlackFunctionHandler<
  typeof ConnectFunction.definition
> = async (
  { inputs, token },
) => {
  await setSettings(token, {
    channel_id: inputs.channel_id,
    session_id: inputs.session_id,
    subdomain: inputs.subdomain,
    last_polled: new Date().getTime(),
  });

  return await {
    outputs: {},
  };
};

export default connect_function;
