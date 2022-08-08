import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SubscribeFunction } from "./definition.ts";

const approval: SlackFunctionHandler<typeof SubscribeFunction.definition> =
  async ({ inputs, token }) => {
    console.log("Incoming approval!");
    const client = SlackAPI(token);

    await client.chat.postMessage({
      channel: inputs.channel_id,
      blocks: [{
        "type": "actions",
        "block_id": "mah-buttons",
        "elements": [{
          type: "button",
          text: {
            type: "plain_text",
            text: "Approve",
          },
          action_id: "approve_request",
          style: "primary",
        }, {
          type: "button",
          text: {
            type: "plain_text",
            text: "Deny",
          },
          action_id: "deny_request",
          style: "danger",
        }],
      }],
    });

    return {
      completed: false,
    };
  };

export default approval;
