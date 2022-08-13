import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { PollFunction } from "./definition.ts";
import { Salesforce } from "../../backend/salesforce.ts";

const poll_function: SlackFunctionHandler<
  typeof PollFunction.definition
> = async (
  { inputs, token },
) => {
  await Salesforce.getUpdatedObjectRecords(token, inputs.channel_id);

  return await {
    outputs: {},
  };
};

export default poll_function;
