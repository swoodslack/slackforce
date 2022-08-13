import { Trigger } from "deno-slack-api/types.ts";

const linkTrigger: Trigger = {
  type: "shortcut",
  name: "Manage",
  description: "Manage subscriptions for this channel",
  workflow: "#/workflows/manage_workflow",
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
