import {
  DefineDatastore,
  DefineFunction,
  DefineWorkflow,
  Manifest,
  Schema,
} from "deno-slack-sdk/mod.ts";

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

// START Subscription
export const SubscribeChannelToSalesforceFunction = DefineFunction({
  callback_id: "subscribe_channel_to_salesforce_function",
  title: "Subscribe to Salesforce",
  description: "Subscribe this channel to changes in your Salesforce org",
  source_file: "functions/subscribe_channel_to_salesforce.ts",
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

export const SubscribeToSalesforceWorkflow = DefineWorkflow({
  callback_id: "subscribe_channel_to_salesforce_workflow",
  title: "Subscribe to Salesforce",
  description: "Subscribe this channel to changes in your Salesforce org",
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
const subscribeForm = SubscribeToSalesforceWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Subscribe to Salesforce",
    submit_label: "Subscribe",
    description: "Subscribe this channel to changes in your Salesforce org",
    interactivity: SubscribeToSalesforceWorkflow.inputs.interactivity,
    fields: {
      required: [
        "channel_id",
        "subdomain",
        "session_id",
      ],
      elements: [
        {
          name: "channel_id",
          title: "Link to channel",
          type: Schema.slack.types.channel_id,
          default: SubscribeToSalesforceWorkflow.inputs.channel_id,
        },
        {
          name: "subdomain",
          title: "Salesforce Subdomain",
          type: Schema.types.string,
        },
        {
          name: "session_id",
          title: "Salesforce Session Id",
          type: Schema.types.string,
        },
      ],
    },
  },
);
LinkChannelToSalesforceWorkflow.addStep(LinkChannelToSalesforceFunction, {
  channel_id: subscribeForm.outputs.fields.channel_id,
  subdomain: subscribeForm.outputs.fields.subdomain,
  session_id: subscribeForm.outputs.fields.session_id,
});
LinkChannelToSalesforceWorkflow.addStep(
  Schema.slack.functions.SendEphemeralMessage,
  {
    user_id: LinkChannelToSalesforceWorkflow.inputs.interactivity.interactor,
    channel_id: subscribeForm.outputs.fields.channel_id,
    message: "All set! Good work linking Slack with Salesforce :)",
  },
);

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
    },
    required: [
      "channel_id",
      "sobject",
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
const subscriptionForm = SubscribeToUpdatesWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Subscribe to Updates",
    submit_label: "Subscribe",
    description: "Send messages to Slack when changes happen in Salesforce",
    interactivity: SubscribeToUpdatesWorkflow.inputs.interactivity,
    fields: {
      required: [
        "channel_id",
        "sobject",
      ],
      elements: [
        {
          name: "channel_id",
          title: "Channel to refresh",
          type: Schema.slack.types.channel_id,
          default: SubscribeToUpdatesWorkflow.inputs.channel_id,
        },
        {
          name: "sobject",
          title: "Changes to object",
          type: Schema.types.string,
          default: "Opportunity",
        },
      ],
    },
  },
);
SubscribeToUpdatesWorkflow.addStep(
  SubscribeToUpdatesFunction,
  {
    channel_id: subscriptionForm.outputs.fields.channel_id,
    sobject: subscriptionForm.outputs.fields.sobject,
  },
);

export default Manifest({
  name: "Salesforce Poops",
  description: "Send messages to Slack based on changes in Salesforce.",
  icon: "assets/icon.png",
  workflows: [
    LinkChannelToSalesforceWorkflow,
    RefreshObjectDescriptionsWorkflow,
    SubscribeToUpdatesWorkflow,
  ],
  functions: [
    LinkChannelToSalesforceFunction,
    RefreshObjectDescriptionsFunction,
    SubscribeToUpdatesFunction,
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
