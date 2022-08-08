import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ConnectFunction } from "../functions/connect/definition.ts";

export const ConnectWorkflow = DefineWorkflow({
  callback_id: "connect_workflow",
  title: "Connect Channel",
  description: "Connects the channel to your Salesforce",
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

const updatesForm = ConnectWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Link to Salesforce",
    submit_label: "Link",
    description: "Link this channel to your Salesforce org",
    interactivity: ConnectWorkflow.inputs.interactivity,
    fields: {
      required: [
        "channel_id",
        "subdomain",
        "session_id",
      ],
      elements: [
        {
          name: "channel_id",
          title: "Post to",
          type: Schema.slack.types.channel_id,
          default: ConnectWorkflow.inputs.channel_id,
        },
        {
          name: "subdomain",
          title: "Subdomain",
          type: Schema.types.string,
        },
        {
          name: "session_id",
          title: "Session Id",
          type: Schema.types.string,
        },
      ],
    },
  },
);

ConnectWorkflow.addStep(ConnectFunction, {
  channel_id: updatesForm.outputs.fields.channel_id,
  subdomain: updatesForm.outputs.fields.subdomain,
  session_id: updatesForm.outputs.fields.session_id,
});
