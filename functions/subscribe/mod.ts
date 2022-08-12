import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SubscribeFunction } from "./definition.ts";
import { getObjectsList, SObject } from "../../backend/salesforce.ts";
import { setSubscription } from "../../backend/storage.ts";
import { createScheduledTrigger } from "../../backend/slack.ts";

export const viewSubmission = async (
  { body, view, inputs, token, env }: any,
) => {
  console.log("View submission invoked!");
  if (view.callback_id === "subscribe_modal") {
    const client = SlackAPI(token, {
      slackApiUrl: env.SLACK_API_URL,
    });

    console.log(
      view["state"]["values"]["modal_action_channel_id"]["channel_id"][
        "selected_channel"
      ],
    );
    console.log(
      view["state"]["values"]["modal_action_sobject"]["sobject"][
        "selected_option"
      ]["value"],
    );

    // Save this subscription into the data store
    await setSubscription(token, {
      channel_id:
        view["state"]["values"]["modal_action_channel_id"]["channel_id"][
          "selected_channel"
        ],
      sobject: view["state"]["values"]["modal_action_sobject"]["sobject"][
        "selected_option"
      ]["value"],
      filters: [],
    });

    // Create a scheduled trigger to poll the API for this subscription
    await createScheduledTrigger(token);

    const outputs = {
      subscribed: true,
    };
    const completeResp = await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs,
    });
    console.log("completeResp: ");
    console.log(completeResp);
    if (!completeResp.ok) {
      console.log("error completing fn", completeResp);
    }
  }
};

const subscribe_modal: SlackFunctionHandler<
  typeof SubscribeFunction.definition
> = async ({ inputs, token }) => {
  console.log(`Executing SubscribeFunction`);
  const client = SlackAPI(token);

  // Add the dynamic lookups - dialog is now working
  const sobjects: SObject[] = await getObjectsList(token, inputs.channel_id);

  // Need to comment this back in since I am assuming this code is working for Steve
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
      callback_id: "subscribe_modal",
      title: {
        type: "plain_text",
        text: "Subscribe to Salesforce",
      },
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
          "block_id": "modal_action_channel_id",
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
          "block_id": "modal_action_sobject",
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
