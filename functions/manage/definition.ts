import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const ManageFunction = DefineFunction({
  callback_id: "manage_function",
  title: "Manage",
  description: "Manage subscriptions for this channel",
  source_file: "functions/manage/mod.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
        description: "Channel for subscriptions",
      },
    },
    required: [
      "interactivity",
      "channel_id",
    ],
  },
});
