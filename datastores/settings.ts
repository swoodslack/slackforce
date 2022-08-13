import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const SettingsDatastore = DefineDatastore({
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
    trigger_id: {
      type: Schema.types.string,
    },
    last_polled: {
      type: Schema.types.number,
    },
  },
});
