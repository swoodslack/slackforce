import { Trigger } from "deno-slack-api/types.ts";

const linkTrigger: Trigger = {
  type: "shortcut",
  name: "Subscribe",
  description: "Subscribe to record updates",
  workflow: "#/workflows/subscribe_workflow",
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
