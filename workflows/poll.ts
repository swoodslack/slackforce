import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { PollFunction } from "../functions/poll/definition.ts";

export const PollWorkflow = DefineWorkflow({
  callback_id: "poll_workflow",
  title: "Poll Updates",
  description: "Poll Salesforce for record updates",
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
PollWorkflow.addStep(
  PollFunction,
  {
    channel_id: PollWorkflow.inputs.channel_id,
  },
);
