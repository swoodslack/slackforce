import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { SubscribeToUpdatesFunction } from "../manifest.ts";
import { getUpdatedObjectRecords } from "../backend/salesforce.ts";

const subscribe_to_updates: SlackFunctionHandler<
  typeof SubscribeToUpdatesFunction.definition
> = async (
  { inputs, env, token },
) => {
  await getUpdatedObjectRecords(token, inputs.channel_id);

  return await {
    outputs: {},
  };
};

export default subscribe_to_updates;
