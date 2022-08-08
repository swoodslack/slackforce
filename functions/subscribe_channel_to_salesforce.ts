import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { SubscribeChannelToSalesforceFunction } from "../manifest.ts";
import { setSettings } from "../backend/storage.ts";

const subscribe_channel_to_salesforce: SlackFunctionHandler<
  typeof SubscribeChannelToSalesforceFunction.definition
> = async (
  { inputs, env, token },
) => {
  console.log(inputs.subdomain);
  console.log(inputs.channel_id);

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

export default subscribe_channel_to_salesforce;
