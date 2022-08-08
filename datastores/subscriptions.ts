import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const SubscriptionsDatastore = DefineDatastore({
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
