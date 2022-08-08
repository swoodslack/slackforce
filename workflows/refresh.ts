import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { RefreshFunction } from "../functions/refresh/definition.ts";

export const RefreshWorkflow = DefineWorkflow({
  callback_id: "refresh_workflow",
  title: "Refresh Salesforce",
  description: "Refreshes with any changes to Salesforce",
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

const refreshForm = RefreshWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Refresh Salesforce",
    submit_label: "Refresh",
    description: "Refreshes with any changes to Salesforce",
    interactivity: RefreshWorkflow.inputs.interactivity,
    fields: {
      required: [
        "channel_id",
      ],
      elements: [
        {
          name: "channel_id",
          title: "Channel to refresh",
          type: Schema.slack.types.channel_id,
          default: RefreshWorkflow.inputs.channel_id,
        },
      ],
    },
  },
);

RefreshWorkflow.addStep(
  RefreshFunction,
  { channel_id: refreshForm.outputs.fields.channel_id },
);
