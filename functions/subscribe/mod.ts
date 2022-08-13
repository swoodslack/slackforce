import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SubscribeFunction } from "./definition.ts";
import { Salesforce, SObject } from "../../backend/salesforce.ts";
import { ObjectDescribe, Settings, Storage } from "../../backend/storage.ts";
import { Slack } from "../../backend/slack.ts";

const openObjectSelectionForm = async (
  token: string,
  interactivity_pointer: string,
  channel_id: string,
) => {
  // Add the dynamic lookups
  const sobjects: SObject[] = await Salesforce.getObjectsList(
    token,
    channel_id,
  );

  const sobjectOptions = [];
  // Get the sobjects available for this channel
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

  const client = SlackAPI(token);
  const open_response = await client.views.open({
    channel: channel_id,
    trigger_id: interactivity_pointer,
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

  if (!open_response.ok) {
    console.log(`Error calling apps.datastore.put: ${open_response.error}`);
    throw new Error(open_response.error);
  }
};

const pushFilterCreationForm = async (
  token: string,
  interactivity_pointer: string,
  channel_id: string,
  sobject: string,
) => {
  // Get the settings to determine if we have a trigger
  const settings: Settings = await Storage.getSettings(token, channel_id);

  // Add the dynamic lookups
  const objectDescribe: ObjectDescribe = await Salesforce
    .getObjectDescribe(
      settings,
      sobject,
    );

  const fieldOptions = [];
  // Get the fields available for this sobject
  if (
    objectDescribe != null && objectDescribe.fields != null &&
    objectDescribe.fields.length > 0
  ) {
    for (let x = 0; x < objectDescribe.fields.length; x++) {
      fieldOptions.push({
        "text": {
          "type": "plain_text",
          "text": objectDescribe.fields[x].label,
          "emoji": true,
        },
        "value": objectDescribe.fields[x].name,
      });
    }
  }
  // console.log(`Options block kit: ${JSON.stringify(sobjectOptions)}`);

  const client = SlackAPI(token);
  const open_response = await client.views.push({
    channel: channel_id,
    trigger_id: interactivity_pointer,
    view: {
      type: "modal",
      callback_id: "filter_modal",
      title: {
        type: "plain_text",
        text: "Subscribe to Salesforce",
      },
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `You can also add a filter for ${!sobject} records`,
          },
        },
        {
          "type": "actions",
          "block_id": "modal_action_filter",
          "elements": [
            {
              "type": "static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Field",
                "emoji": true,
              },
              "options": fieldOptions,
              "action_id": "field",
            },
            {
              "type": "static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Field",
                "emoji": true,
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "is greater than",
                    "emoji": true,
                  },
                  "value": ">",
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "is greater than or equal to",
                    "emoji": true,
                  },
                  "value": ">=",
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "is equal to",
                    "emoji": true,
                  },
                  "value": "=",
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "is less than or equal to",
                    "emoji": true,
                  },
                  "value": "<=",
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "is less than",
                    "emoji": true,
                  },
                  "value": "<",
                },
              ],
              "action_id": "sobject",
            },
            {
              "type": "input",
              "placeholder": {
                "type": "plain_text",
                "text": "Value",
                "emoji": true,
              },
              "action_id": "field",
            },
          ],
        },
      ],
      submit: {
        type: "plain_text",
        text: "Subscribe",
      },
    },
  });

  if (!open_response.ok) {
    console.log(`Error calling apps.datastore.put: ${open_response.error}`);
    throw new Error(open_response.error);
  }
};

export const viewSubmission = async (
  { body, view, inputs, token }: any,
) => {
  if (view.callback_id === "subscribe_modal") {
    const sobject = view["state"]["values"]["modal_action_sobject"]["sobject"][
      "selected_option"
    ]["value"];
    console.log(`Selected sobject: ${sobject}`);

    await pushFilterCreationForm(
      token,
      inputs.interactivity.interactivity_pointer,
      inputs.channel_id,
      sobject,
    );
  } else if (view.callback_id === "filter_modal") {
    const client = SlackAPI(token);

    const sobject = view["state"]["values"]["modal_action_sobject"]["field"][
      "selected_option"
    ]["value"];
    console.log(`Stored sobject from previous view: ${sobject}`);

    const field = view["state"]["values"]["modal_action_sobject"]["field"][
      "selected_option"
    ]["value"];
    const comparison =
      view["state"]["values"]["modal_action_sobject"]["comparison"][
        "selected_option"
      ]["value"];
    const value =
      view["state"]["values"]["modal_action_sobject"]["comparison"]["value"];
    console.log(`Filter submitted is: ${field} ${comparison} ${value}`);

    // Get the settings to determine if we have a trigger
    const settings: Settings = await Storage.getSettings(
      token,
      inputs.channel_id,
    );

    // Save this subscription into the data store so it will be picked up in the next poll
    await Storage.setSubscription(token, {
      channel_id: inputs.channel_id,
      sobject: sobject,
      filters: [
        {
          field: field,
          comparison: comparison,
          value: value,
        },
      ],
    });

    // Refresh the metadata for Salesforce that's used for this channel
    await Salesforce.refreshObjectDescriptions(token, inputs.channel_id);

    // We don't have a scheduled trigger running for this channel
    if (!settings.trigger_id) {
      // Create a scheduled trigger to poll the API for this subscription
      const trigger_id = await Slack.createScheduledTrigger(
        token,
        inputs.channel_id,
      );

      // Update the settings appropriately
      settings.trigger_id = trigger_id;
      await Storage.setSettings(token, settings);
    }

    const outputs = {
      subscribed: true,
    };

    // Tell the platform the function has completed successfully
    const complete_response = await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs,
    });

    if (!complete_response.ok) {
      console.log(
        `Error calling client.functions.completeSuccess: ${complete_response.error}`,
      );
      throw new Error(complete_response.error);
    }
  }
};

const subscribe_modal: SlackFunctionHandler<
  typeof SubscribeFunction.definition
> = async ({ inputs, token }) => {
  console.log(`Executing SubscribeFunction`);
  await openObjectSelectionForm(
    token,
    inputs.interactivity.interactivity_pointer,
    inputs.channel_id,
  );

  return {
    completed: false,
  };
};

export default subscribe_modal;
