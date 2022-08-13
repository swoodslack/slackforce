import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { ManageFunction } from "./definition.ts";
import {
  ObjectDescribe,
  Settings,
  Subscription,
} from "../../backend/interfaces.ts";
import { Storage } from "../../backend/storage.ts";
import { Slack } from "../../backend/slack.ts";

export const viewSubmission = async (
  { body, view, inputs, token, env }: any,
) => {
  console.log("View submission invoked!");
  if (view.callback_id === "subscribe_modal") {
    const client = SlackAPI(token, {
      slackApiUrl: env.SLACK_API_URL,
    });

    // Get the settings to determine if we have a trigger
    const settings: Settings = await Storage.getSettings(
      token,
      inputs.channel_id,
    );

    // Get the acted on subscription
    const subscriptionId = "asdfasdfasdf";
    const subscription: Subscription = await Storage.getSubscription(
      token,
      subscriptionId,
    );

    // Check to see if we have any subscriptions left once this subscription is deleted
    const subscriptions: Subscription[] = await Storage.getSubscriptions(
      token,
      inputs.channel_id,
    );
    if (
      settings.trigger_id != null && settings.trigger_id.trim().length > 0 &&
      subscriptions != null && subscriptions.length == 1 &&
      subscriptions[0].id === subscription.id
    ) {
      console.log(`Deleting scheduled trigger: ${settings.trigger_id}`);
      // Delete the scheduled trigger as this is the last subscription
      await Slack.deleteScheduledTrigger(token, settings.trigger_id);

      // Update the settings to reflext the change
      settings.trigger_id = undefined;
      await Storage.setSettings(token, settings);
    }

    // Remove this subscription into the data store
    await Storage.removeSubscription(token, subscription);

    // Tell the platform the function has completed successfully
    const complete_response = await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
    });

    if (!complete_response.ok) {
      console.log(
        `Error calling client.functions.completeSuccess: ${complete_response.error}`,
      );
      throw new Error(complete_response.error);
    }
  }
};

const manage_modal: SlackFunctionHandler<
  typeof ManageFunction.definition
> = async ({ inputs, token }) => {
  console.log(`Executing ManageFunction`);
  const client = SlackAPI(token);

  // Add the dynamic lookups
  const subscriptions: Subscription[] = await Storage.getSubscriptions(
    token,
    inputs.channel_id,
  );

  // Need to comment this back in since I am assuming this code is working for Steve
  const availableSubscriptions = [];
  // Get the subscriptions available for this user
  if (subscriptions != null && subscriptions.length > 0) {
    for (let x = 0; x < subscriptions.length; x++) {
      const sobjectDescribe: ObjectDescribe = await Storage.getObjectDescribe(
        token,
        inputs.channel_id,
        subscriptions[x].sobject,
      );

      // Construct the filters as a string
      let filtersContent = "";
      if (
        subscriptions[x].filters != null && subscriptions[x].filters.length > 0
      ) {
        for (let y = 0; y < subscriptions[x].filters.length; y++) {
          filtersContent += `${subscriptions[x].filters[y].field} ${
            subscriptions[x].filters[y].comparison
          } ${subscriptions[x].filters[y].value}\n`;
        }
      }

      availableSubscriptions.push({
        "type": "section",
        "block_id": subscriptions[x].id,
        "value": subscriptions[x].id,
        "text": {
          "type": "mrkdwn",
          "text":
            `*Object:* ${sobjectDescribe.label}\n*Filters:*\n${filtersContent}`,
        },
      });
      availableSubscriptions.push({
        "type": "actions",
        "block_id": "modal_action_delete",
        "elements": [
          {
            "type": "button",
            "placeholder": {
              "type": "plain_text",
              "text": "Delete",
              "emoji": true,
            },
            "action_id": "channel_id",
          },
        ],
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
            "text": "Manage subscriptions for this channel",
          },
        },
        availableSubscriptions,
      ],
      submit: {
        type: "plain_text",
        text: "Done",
      },
    },
  });
  console.log(result);

  return {
    completed: false,
  };
};

export default manage_modal;
