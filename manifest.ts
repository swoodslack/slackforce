import { Manifest } from "deno-slack-sdk/mod.ts";
import { ObjectDescribeDatastore } from "./datastores/object_describe.ts";
import { SettingsDatastore } from "./datastores/settings.ts";
import { SubscriptionsDatastore } from "./datastores/subscriptions.ts";
import { ConnectFunction } from "./functions/connect/definition.ts";
import { ConnectWorkflow } from "./workflows/connect.ts";
import { RefreshFunction } from "./functions/refresh/definition.ts";
import { RefreshWorkflow } from "./workflows/refresh.ts";
import { SubscribeFunction } from "./functions/subscribe/definition.ts";
import { SubscribeWorkflow } from "./workflows/subscribe.ts";
import { PollFunction } from "./functions/poll/definition.ts";
import { PollWorkflow } from "./workflows/poll.ts";

export default Manifest({
  name: "Salesforce Poops",
  description: "Send messages to Slack based on changes in Salesforce.",
  icon: "assets/icon.png",
  workflows: [
    ConnectWorkflow,
    RefreshWorkflow,
    SubscribeWorkflow,
    PollWorkflow,
  ],
  functions: [
    ConnectFunction,
    RefreshFunction,
    SubscribeFunction,
    PollFunction,
  ],
  datastores: [
    SubscriptionsDatastore,
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
