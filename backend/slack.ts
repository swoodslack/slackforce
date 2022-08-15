import { SlackAPI } from "deno-slack-api/mod.ts";
import { LayoutBlock, ObjectDescribe } from "./interfaces.ts";

export class Slack {
  static sendMessage = async (
    token: string,
    channel_id: string,
    object_describe: ObjectDescribe,
    layout_blocks: LayoutBlock[],
  ) => {
    console.log(
      `Executing sendMessage(token: ${token}, channel_id: ${channel_id}, object_describe: ${
        JSON.stringify(object_describe)
      }, layout_blocks: ${JSON.stringify(layout_blocks)})`,
    );

    // Create the message block kit
    let text = `*An object has been updated: ${object_describe.name}!*\n`;
    for (let x = 0; x < layout_blocks.length; x++) {
      text += `*${layout_blocks[x].label}:* ${layout_blocks[x].value}\n`;
    }
    const blocks = [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": text,
      },
      "accessory": {
        "type": "image",
        "image_url":
          "https://assets.stickpng.com/images/580b57fcd9996e24bc43c39c.png",
        "alt_text": "Salesforce Poop",
      },
    }];

    // TODO: Create the metadata payload - doing this as a string because Typescript
    let event =
      `{ "event_type": "poops_${object_describe.name.toLowerCase()}",`;
    event += `"event_payload": {`;
    for (let x = 0; x < layout_blocks.length; x++) {
      event += `"${layout_blocks[x].name.toLowerCase()}": "${
        layout_blocks[x].value
      }",`;
    }
    event = `${event.substring(0, event.length - 1)} }}`;

    const client = SlackAPI(token, {});
    await client.apiCall("chat.postMessage", {
      channel: channel_id,
      blocks: blocks,
      metadata: JSON.parse(event),
    });
  };

  static createScheduledTrigger = async (
    token: string,
    channel_id: string,
  ): Promise<string> => {
    const client = SlackAPI(token, {});

    // TODO: Schedule for a minute in the future just for testing
    const dateSoon = new Date();
    dateSoon.setMinutes(dateSoon.getMinutes() + 1);

    const create_response = await client.workflows.triggers.create({
      type: "scheduled",
      name: "Get Updated Object Records",
      description: "Get the data based on channel subscriptions",
      workflow: "#/workflows/poll_workflow",
      schedule: {
        start_time: dateSoon.toISOString(),
      },
      inputs: {
        channel_id: { value: channel_id },
      },
    });

    if (!create_response.ok) {
      console.log(
        `Error calling client.workflows.triggers.create: ${create_response.error}`,
      );
      throw new Error(create_response.error);
    }

    console.log(
      `Scheduled trigger created: ${JSON.stringify(create_response)}`,
    );
    return "asdfadsf";
  };

  static deleteScheduledTrigger = async (
    token: string,
    trigger_id: string,
  ) => {
    const client = SlackAPI(token, {});

    const delete_response = await client.workflows.triggers.delete({
      trigger_id: trigger_id,
    });

    if (!delete_response.ok) {
      console.log(
        `Error calling client.workflows.triggers.delete: ${delete_response.error}`,
      );
      throw new Error(delete_response.error);
    }

    console.log(
      `Scheduled trigger removed: ${JSON.stringify(delete_response)}`,
    );
  };
}
