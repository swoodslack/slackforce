import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const ObjectDescribeDatastore = DefineDatastore({
  name: "object_describe_datastore",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel_id: {
      type: Schema.types.string,
    },
    trigger_id: {
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
