import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { RefreshFunction } from "./definition.ts";
import { Salesforce } from "../../backend/salesforce.ts";

const refresh_function: SlackFunctionHandler<
  typeof RefreshFunction.definition
> = async (
  { inputs, token },
) => {
  await Salesforce.refreshObjectDescriptions(token, inputs.channel_id);

  return await {
    outputs: {},
  };
};

export default refresh_function;
