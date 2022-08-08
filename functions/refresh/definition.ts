import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const RefreshFunction = DefineFunction({
  callback_id: "refresh_function",
  title: "Refresh Salesforce",
  description: "Refreshes with any changes to Salesforce",
  source_file: "functions/refresh/mod.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "channel_id",
    ],
  },
});
