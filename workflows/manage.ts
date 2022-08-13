import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ManageFunction } from "../functions/manage/definition.ts";

export const ManageWorkflow = DefineWorkflow({
  callback_id: "manage_workflow",
  title: "Manage",
  description: "Manage subscriptions for this channel",
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

ManageWorkflow.addStep(
  ManageFunction,
  {
    interactivity: ManageWorkflow.inputs.interactivity,
    channel_id: ManageWorkflow.inputs.channel_id,
  },
);
