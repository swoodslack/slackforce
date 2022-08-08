import { Trigger } from "deno-slack-api/types.ts";

const linkTrigger: Trigger = {
  type: "shortcut",
  name: "Connect Channel",
  description: "Connects the channel to your Salesforce",
  workflow: "#/workflows/connect_workflow",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel_id: {
      value: "{{data.channel_id}}",
    },
  },
};

export default linkTrigger;
