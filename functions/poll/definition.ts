import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const PollFunction = DefineFunction({
  callback_id: "poll_function",
  title: "Poll Updates",
  description: "Poll Salesforce for record updates",
  source_file: "functions/poll/mod.ts",
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
