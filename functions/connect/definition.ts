import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const ConnectFunction = DefineFunction({
  callback_id: "connect_function",
  title: "Connect Channel",
  description: "Connects the channel to your Salesforce",
  source_file: "functions/connect/mod.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      subdomain: {
        type: Schema.types.string,
        description: "The subdomain of the Salesforce org",
      },
      session_id: {
        type: Schema.types.string,
        description: "Your active session ID",
      },
    },
    required: [
      "channel_id",
      "subdomain",
      "session_id",
    ],
  },
});
