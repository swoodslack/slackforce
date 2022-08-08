import {
  BlockActionsRouter,
  DefineFunction,
  Schema,
} from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";

export const SubscribeFunction = DefineFunction({
  callback_id: "review_approval",
  title: "Subscribe",
  description: "Subscribe to record updates",
  source_file: "functions/subscribe/mod.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
        description: "Post updates to this channel",
      },
    },
    required: [
      "channel_id",
    ],
  },
  output_parameters: {
    properties: {
      approved: {
        type: Schema.types.boolean,
        description: "Approved",
      },
      reviewer: {
        type: Schema.slack.types.user_id,
        description: "Reviewer",
      },
      message_ts: {
        type: Schema.types.string,
        description: "Request Message TS",
      },
    },
    required: ["approved", "reviewer", "message_ts"],
  },
});

const ActionsRouter = BlockActionsRouter(SubscribeFunction);
// Now can use the router's addHandler method to register different handlers based on action properties like
// action_id or block_id
export const blockActions = ActionsRouter.addHandler(
  ["approve_request", "deny_request"],
  async ({ action, body, token }) => {
    console.log("Incoming action handler invocation", action);
    const client = SlackAPI(token);

    const outputs = {
      reviewer: body.user.id,
      approved: action.action_id === "approve_request",
      message_ts: body.message.ts,
    };

    // Remove the button from the original message using the chat.update API
    // and replace its contents with the result of the approval.
    await client.chat.update({
      channel: body.function_data.inputs.channel_id,
      ts: outputs.message_ts,
      blocks: [{
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${
              outputs.approved ? " :white_check_mark: Approved" : ":x: Denied"
            } by <@${outputs.reviewer}>`,
          },
        ],
      }],
    });

    // And now we can mark the function as 'completed' - which is required as
    // we explicitly marked it as incomplete in the main function handler.
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs,
    });
  },
);
