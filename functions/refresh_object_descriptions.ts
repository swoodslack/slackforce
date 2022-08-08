import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { LinkChannelToSalesforceFunction } from "../manifest.ts";
import { refreshObjectDescriptions } from "../backend/salesforce.ts";

const refresh_object_descriptions: SlackFunctionHandler<
  typeof LinkChannelToSalesforceFunction.definition
> = async (
  { inputs, env, token },
) => {
  await refreshObjectDescriptions(token, inputs.channel_id);

  return await {
    outputs: {},
  };
};

export default refresh_object_descriptions;
