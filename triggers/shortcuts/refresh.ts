import { Trigger } from "deno-slack-api/types.ts";

const linkTrigger: Trigger = {
  type: "shortcut",
  name: "Refresh Salesforce",
  description: "Refreshes with any changes to Salesforce",
  workflow: "#/workflows/refresh_workflow",
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
