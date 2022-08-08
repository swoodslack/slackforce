import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { SubscribeToUpdatesFunction } from "../manifest.ts";
import { Filter, setSubscription } from "../backend/storage.ts";
import { createScheduledTrigger } from "../backend/slack.ts";

const subscribe_to_updates: SlackFunctionHandler<
  typeof SubscribeToUpdatesFunction.definition
> = async (
  { inputs, env, token },
) => {
  // Construct the filters from the flat definition
  const filters: Filter[] = [];
  filters.push({
    field: inputs.field,
    comparison: inputs.comparison,
    value: new String(inputs.value).toString(),
  });

  await setSubscription(token, {
    channel_id: inputs.channel_id,
    sobject: inputs.sobject,
    filters: filters,
  });
  await createScheduledTrigger(token);

  return await {
    outputs: {},
  };
};

export default subscribe_to_updates;
