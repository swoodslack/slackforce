import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import type { GetUpdatedObjectRecordsFunction } from "../manifest.ts";
import { getUpdatedObjectRecords } from "../backend/salesforce.ts";

const get_updated_object_records: SlackFunctionHandler<
  typeof GetUpdatedObjectRecordsFunction.definition
> = async (
  { inputs, env, token },
) => {
  await getUpdatedObjectRecords(token, inputs.channel_id);

  return await {
    outputs: {},
  };
};

export default get_updated_object_records;
