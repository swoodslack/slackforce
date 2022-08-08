import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SubscribeFunction } from "../functions/subscribe/definition.ts";

export const SubscribeWorkflow = DefineWorkflow({
  callback_id: "subscribe_workflow",
  title: "Subscribe",
  description: "Subscribe to record updates",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "interactivity",
      "channel_id",
    ],
  },
});

SubscribeWorkflow.addStep(
  SubscribeFunction,
  {
    channel_id: SubscribeWorkflow.inputs.channel_id,
  },
);
