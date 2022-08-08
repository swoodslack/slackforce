import {
  DefineDatastore,
  DefineFunction,
  DefineWorkflow,
  Manifest,
  Schema,
} from "deno-slack-sdk/mod.ts";
import { SubscribeFunction } from "./functions/subscribe/definition.ts";

const ObjectDescribeDatastore = DefineDatastore({
  name: "object_describe_datastore",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel_id: {
      type: Schema.types.string,
    },
    sobject: {
      type: Schema.types.string,
    },
    describe: {
      type: Schema.types.string,
    },
  },
});

const SettingsDatastore = DefineDatastore({
  name: "settings_datastore",
  primary_key: "channel_id",
  attributes: {
    channel_id: {
      type: Schema.types.string,
    },
    subdomain: {
      type: Schema.types.string,
    },
    session_id: {
      type: Schema.types.string,
    },
    last_polled: {
      type: Schema.types.number,
    },
  },
});

const SubscriptionDatastore = DefineDatastore({
  name: "subscriptions_datastore",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel_id: {
      type: Schema.types.string,
    },
    sobject: {
      type: Schema.types.string,
    },
    subdomain: {
      type: Schema.types.string,
    },
    filter: {
      type: Schema.types.string,
    },
  },
});

// START Link
export const LinkChannelToSalesforceFunction = DefineFunction({
  callback_id: "link_channel_to_salesforce_function",
  title: "Link Channel to Salesforce",
  description: "Link this channel to your Salesforce org",
  source_file: "functions/link_channel_to_salesforce.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      subdomain: {
        type: Schema.types.string,
        description: "The subdomain of the Salesforce org",
      },
      session_id: {
        type: Schema.types.string,
        description: "Your active session ID",
      },
    },
    required: [
      "channel_id",
      "subdomain",
      "session_id",
    ],
  },
});

export const LinkChannelToSalesforceWorkflow = DefineWorkflow({
  callback_id: "link_channel_to_salesforce_workflow",
  title: "Link to Salesforce",
  description: "Link this channel to your Salesforce org",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "interactivity",
      "channel_id",
    ],
  },
});
const updatesForm = LinkChannelToSalesforceWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Link to Salesforce",
    submit_label: "Link",
    description: "Link this channel to your Salesforce org",
    interactivity: LinkChannelToSalesforceWorkflow.inputs.interactivity,
    fields: {
      required: [
        "channel_id",
        "subdomain",
        "session_id",
      ],
      elements: [
        {
          name: "channel_id",
          title: "Post to",
          type: Schema.slack.types.channel_id,
          default: LinkChannelToSalesforceWorkflow.inputs.channel_id,
        },
        {
          name: "subdomain",
          title: "Subdomain",
          type: Schema.types.string,
        },
        {
          name: "session_id",
          title: "Session Id",
          type: Schema.types.string,
        },
      ],
    },
  },
);
LinkChannelToSalesforceWorkflow.addStep(LinkChannelToSalesforceFunction, {
  channel_id: updatesForm.outputs.fields.channel_id,
  subdomain: updatesForm.outputs.fields.subdomain,
  session_id: updatesForm.outputs.fields.session_id,
});
LinkChannelToSalesforceWorkflow.addStep(
  Schema.slack.functions.SendEphemeralMessage,
  {
    user_id: LinkChannelToSalesforceWorkflow.inputs.interactivity.interactor,
    channel_id: updatesForm.outputs.fields.channel_id,
    message: "All set! Good work linking Slack with Salesforce :)",
  },
);
// FINISH Link

// START Refresh
export const RefreshObjectDescriptionsFunction = DefineFunction({
  callback_id: "refresh_object_descriptions_function",
  title: "Refresh Salesforce",
  description: "Refresh Slack's understanding of your Salesforce",
  source_file: "functions/refresh_object_descriptions.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "channel_id",
    ],
  },
});

export const RefreshObjectDescriptionsWorkflow = DefineWorkflow({
  callback_id: "refresh_object_descriptions_workflow",
  title: "Refresh Salesforce",
  description: "Refresh Slack's understanding of your Salesforce",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "interactivity",
      "channel_id",
    ],
  },
});
const refreshForm = RefreshObjectDescriptionsWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Refresh Salesforce",
    submit_label: "Refresh",
    description: "Refresh Slack's understanding of your Salesforce",
    interactivity: RefreshObjectDescriptionsWorkflow.inputs.interactivity,
    fields: {
      required: [
        "channel_id",
      ],
      elements: [
        {
          name: "channel_id",
          title: "Channel to refresh",
          type: Schema.slack.types.channel_id,
          default: RefreshObjectDescriptionsWorkflow.inputs.channel_id,
        },
      ],
    },
  },
);
RefreshObjectDescriptionsWorkflow.addStep(
  RefreshObjectDescriptionsFunction,
  { channel_id: refreshForm.outputs.fields.channel_id },
);
// END Refresh

// START Subscribe Criteria
export const SubscribeToUpdatesFunction = DefineFunction({
  callback_id: "subscribe_to_updates_function",
  title: "Subscribe to Updates",
  description: "Send messages to Slack when changes happen in Salesforce",
  source_file: "functions/subscribe_to_updates.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      sobject: {
        type: Schema.types.string,
      },
      field: {
        type: Schema.types.string,
      },
      comparison: {
        type: Schema.types.string,
      },
      value: {
        type: Schema.types.number,
      },
    },
    required: [
      "channel_id",
      "sobject",
      "field",
      "comparison",
      "value",
    ],
  },
});

export const SubscribeToUpdatesWorkflow = DefineWorkflow({
  callback_id: "subscribe_to_updates_workflow",
  title: "Subscribe to Updates",
  description: "Send messages to Slack when changes happen in Salesforce",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "interactivity",
      "channel_id",
    ],
  },
});
SubscribeToUpdatesWorkflow.addStep(
  SubscribeFunction,
  {
    channel_id: SubscribeToUpdatesWorkflow.inputs.channel_id,
  },
);
// END Subscribe Criteria

// START Get Updated Object Records
export const GetUpdatedObjectRecordsFunction = DefineFunction({
  callback_id: "get_updated_object_records_function",
  title: "Get Updated Object Records",
  description: "Get the data based on channel subscriptions",
  source_file: "functions/get_updated_object_records.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "channel_id",
    ],
  },
});

export const GetUpdatedObjectRecordsWorkflow = DefineWorkflow({
  callback_id: "get_updated_object_records_workflow",
  title: "Get Updated Object Records",
  description: "Get the data based on channel subscriptions",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "channel_id",
    ],
  },
});
GetUpdatedObjectRecordsWorkflow.addStep(
  GetUpdatedObjectRecordsFunction,
  {
    channel_id: GetUpdatedObjectRecordsWorkflow.inputs.channel_id,
  },
);
// END Scheduled Poll

export default Manifest({
  name: "Salesforce Poops",
  description: "Send messages to Slack based on changes in Salesforce.",
  icon: "assets/icon.png",
  workflows: [
    LinkChannelToSalesforceWorkflow,
    RefreshObjectDescriptionsWorkflow,
    SubscribeToUpdatesWorkflow,
    GetUpdatedObjectRecordsWorkflow,
  ],
  functions: [
    LinkChannelToSalesforceFunction,
    RefreshObjectDescriptionsFunction,
    SubscribeToUpdatesFunction,
    GetUpdatedObjectRecordsFunction,
    SubscribeFunction,
  ],
  datastores: [
    SubscriptionDatastore,
    SettingsDatastore,
    ObjectDescribeDatastore,
  ],
  outgoingDomains: ["salesforce.com"],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "triggers:write",
    "datastore:read",
    "datastore:write",
  ],
});
