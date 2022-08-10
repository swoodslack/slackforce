import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";

export const SubscribeFunction = DefineFunction({
  callback_id: "subscribe_function",
  title: "Subscribe",
  description: "Subscribe to record updates",
  source_file: "functions/subscribe/mod.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
        description: "Post updates to this channel",
      },
    },
    required: [
      "interactivity",
      "channel_id",
    ],
  },
  output_parameters: {
    properties: {
      subscribed: {
        type: Schema.types.boolean,
        description: "Subscribed",
      },
    },
    required: ["subscribed"],
  },
});
