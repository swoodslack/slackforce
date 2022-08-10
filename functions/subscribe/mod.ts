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
      subscribed: action.action_id === "subscribe_request",
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
              outputs.subscribed
                ? " :white_check_mark: Subscribed"
                : ":x: Not completed"
            }`,
          },
        ],
      }],
    });

    // Construct the filters from the flat definition
    // const filters: Filter[] = [];
    // filters.push({
    //   field: inputs.field,
    //   comparison: inputs.comparison,
    //   value: new String(inputs.value).toString(),
    // });

    // await setSubscription(token, {
    //   channel_id: inputs.channel_id,
    //   sobject: inputs.sobject,
    //   filters: filters,
    // });
    // await createScheduledTrigger(token);

    // And now we can mark the function as 'completed' - which is required as
    // we explicitly marked it as incomplete in the main function handler.
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs,
    });
  },
);

const approval: SlackFunctionHandler<typeof SubscribeFunction.definition> =
  async ({ inputs, token }) => {
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
                "initial_channels": [`${inputs.channel_id}`],
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

    /*     await client.chat.postMessage({
      channel: inputs.channel_id,
      blocks: [{
        "type": "actions",
        "block_id": "subscribe_form_buttons",
        "elements": [{
          type: "button",
          text: {
            type: "plain_text",
            text: "Subscribe",
          },
          action_id: "subscribe_request",
          style: "primary",
        }, {
          type: "button",
          text: {
            type: "plain_text",
            text: "Cancel",
          },
          action_id: "cancel_request",
          style: "danger",
        }],
      }],
    });
 */
    return {
      completed: false,
    };
  };

export default approval;
