import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SubscribeFunction } from "./definition.ts";
import { BlockActionsRouter } from "deno-slack-sdk/mod.ts";
import { getObjectsList, SObject } from "../../backend/salesforce.ts";

const ActionsRouter = BlockActionsRouter(SubscribeFunction);

export const blockActions = ActionsRouter.addHandler(
  ["subscribe_modal", "channel_id", "sobject"],
  async ({ action, body, token }) => {
    console.log("Incoming action handler invocation", action);
    const client = SlackAPI(token);

    const outputs = {
      subscribed: true,
    };

    // we explicitly marked it as incomplete in the main function handler.
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs,
    });
  },
);

const subscribe_modal: SlackFunctionHandler<
  typeof SubscribeFunction.definition
> = async ({ inputs, token }) => {
  const client = SlackAPI(token);

  // Add the dynamic lookups - dialog is now working
  const sobjects: SObject[] = await getObjectsList(token, inputs.channel_id);
  const sobjectOptions = [];

  // Get the sobjects available for this user
  if (sobjects != null && sobjects.length > 0) {
    for (let x = 0; x < sobjects.length; x++) {
      sobjectOptions.push({
        "text": {
          "type": "plain_text",
          "text": sobjects[x].label,
          "emoji": true,
        },
        "value": sobjects[x].name,
      });
    }
  }
  // console.log(`Options block kit: ${JSON.stringify(sobjectOptions)}`);

  const result = await client.views.open({
    channel: inputs.channel_id,
    trigger_id: inputs.interactivity.interactivity_pointer,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Subscribe to Salesforce",
      },
      callback_id: "subscribe_modal",
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Let's get you subscribed to some salesforce records!",
          },
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "channels_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select the channel to recieve update messages",
                "emoji": true,
              },
              "action_id": "channel_id",
            },
          ],
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select the object that's being updated",
                "emoji": true,
              },
              "options": sobjectOptions,
              "action_id": "sobject",
            },
          ],
        },
      ],
      submit: {
        type: "plain_text",
        text: "Next",
      },
    },
  });
  // console.log(result);

  return {
    completed: false,
  };
};

export default subscribe_modal;
