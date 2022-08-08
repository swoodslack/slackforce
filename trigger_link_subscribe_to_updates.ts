import { Trigger } from "deno-slack-api/types.ts";

const linkTrigger: Trigger = {
  type: "shortcut",
  name: "Subscribe to Updates",
  description: "Send messages to Slack when changes happen in Salesforce",
  workflow: "#/workflows/subscribe_to_updates_workflow",
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
