import { SlackAPI } from "deno-slack-api/mod.ts";

export interface Settings {
  channel_id: string;
  subdomain: string;
  session_id: string;
  last_polled: number;
  trigger_id?: string;
}

export interface Filter {
  field: string;
  comparison: string;
  value: string;
}

export interface Subscription {
  id?: string;
  channel_id: string;
  sobject: string;
  filters: Filter[];
}

export interface ObjectDescribeFieldOption {
  value: string;
}

export interface ObjectDescribeField {
  name: string;
  label: string;
  type: string;
  options?: ObjectDescribeFieldOption[];
}

export interface ObjectDescribe {
  name: string;
  label: string;
  fields: ObjectDescribeField[];
  layout?: string;
}

export class Storage {
  static getSettings = async (
    token: string,
    channel_id: string,
  ): Promise<Settings> => {
    // console.log(
    //   `Executing getSettings(token: ${token}, channel_id: ${channel_id})`,
    // );
    const client = SlackAPI(token, {});
    const get_response = await client.apps.datastore.get({
      datastore: "settings_datastore",
      id: channel_id,
    });

    if (!get_response.ok) {
      console.log(`Error calling apps.datastore.get: ${get_response.error}`);
      throw new Error(get_response.error);
    }

    console.log(`Settings retrieved: ${JSON.stringify(get_response)}`);
    return <Settings> get_response.item;
  };

  static setSettings = async (
    token: string,
    settings: Settings,
  ) => {
    // console.log(
    //   `Executing setSettings(token: ${token}, settings: ${
    //     JSON.stringify(settings)
    //   })`,
    // );
    const client = SlackAPI(token, {});
    const put_response = await client.apps.datastore.put({
      datastore: "settings_datastore",
      item: {
        channel_id: settings.channel_id,
        trigger_id: settings.trigger_id,
        subdomain: settings.subdomain,
        session_id: settings.session_id,
        last_polled: settings.last_polled,
      },
    });

    if (!put_response.ok) {
      console.log(`Error calling apps.datastore.put: ${put_response.error}`);
      throw new Error(put_response.error);
    }
  };

  static getSubscriptions = async (
    token: string,
    channel_id: string,
  ): Promise<Subscription[]> => {
    // console.log(
    //   `Executing getSubscriptions(token: ${token}, channel_id: ${channel_id})`,
    // );
    const client = SlackAPI(token, {});
    const query_response = await client.apps.datastore.query({
      datastore: "subscriptions_datastore",
      expression: "#channel_id = :channel_id",
      expression_attributes: { "#channel_id": "channel_id" },
      expression_values: { ":channel_id": channel_id },
    });

    if (!query_response.ok) {
      console.log(
        `Error calling apps.datastore.query: ${query_response.error}`,
      );
      throw new Error(query_response.error);
    }

    // console.log(`Subscriptions retrieved: ${JSON.stringify(query_response)}`);
    const subscriptions: Subscription[] = [];
    if (query_response.items != null && query_response.items.length > 0) {
      for (let x = 0; x < query_response.items.length; x++) {
        subscriptions.push({
          id: query_response.items[x].id,
          channel_id: query_response.items[x].channel_id,
          sobject: query_response.items[x].sobject,
          filters: [], //JSON.parse(query_response.items[x].filters),
        });
      }
    }
    return subscriptions;
  };

  static getSubscription = async (
    token: string,
    subscription_id: string,
  ): Promise<Subscription> => {
    console.log(
      `Executing getSubscription(token: ${token}, subscription_id: ${subscription_id})`,
    );
    const client = SlackAPI(token, {});
    const get_response = await client.apps.datastore.get({
      datastore: "subscriptions_datastore",
      id: subscription_id,
    });

    if (!get_response.ok) {
      console.log(
        `Error calling apps.datastore.get: ${get_response.error}`,
      );
      throw new Error(get_response.error);
    }

    console.log(`Subscription retrieved: ${JSON.stringify(get_response)}`);
    return <Subscription> get_response.item;
  };

  static setSubscription = async (
    token: string,
    subscription: Subscription,
  ) => {
    console.log(
      `Executing setSubscription(token: ${token}, subscription: ${
        JSON.stringify(subscription)
      })`,
    );
    const client = SlackAPI(token, {});
    const put_response = await client.apps.datastore.put({
      datastore: "subscriptions_datastore",
      item: {
        id: crypto.randomUUID(),
        channel_id: subscription.channel_id,
        sobject: subscription.sobject,
        filters: JSON.stringify(subscription.filters),
      },
    });

    if (!put_response.ok) {
      console.log(`Error calling apps.datastore.put: ${put_response.error}`);
      throw new Error(put_response.error);
    }
  };

  static removeSubscription = async (
    token: string,
    subscription: Subscription,
  ) => {
    // console.log(
    //   `Executing removeSubscription(token: ${token}, subscription: ${
    //     JSON.stringify(subscription)
    //   })`,
    // );
    if (subscription.id != null) {
      const client = SlackAPI(token, {});
      const delete_response = await client.apps.datastore.delete({
        datastore: "subscriptions_datastore",
        id: subscription.id,
      });

      if (!delete_response.ok) {
        console.log(
          `Error calling apps.datastore.delete: ${delete_response.error}`,
        );
        throw new Error(delete_response.error);
      }
    } else {
      console.log(
        "The subscription cannot be deleted as its missing its identifier.",
      );
      throw new Error("The subscription cannot be deleted.");
    }
  };

  static getObjectDescribe = async (
    token: string,
    channel_id: string,
    sobject: string,
  ): Promise<ObjectDescribe> => {
    // console.log(
    //   `Executing getObjectDescribe(token: ${token}, channel_id: ${channel_id}, sobject: ${sobject})`,
    // );
    const client = SlackAPI(token, {});
    const get_response = await client.apps.datastore.get({
      datastore: "object_describe_datastore",
      id: channel_id.toLowerCase() + "___" + sobject.toLowerCase(),
    });

    if (!get_response.ok) {
      console.log(`Error calling apps.datastore.get: ${get_response.error}`);
      throw new Error(get_response.error);
    }

    // console.log(`ObjectDescribe retrieved: ${JSON.stringify(get_response)}`);
    return <ObjectDescribe> JSON.parse(get_response.item.describe);
  };

  static setObjectDescribe = async (
    token: string,
    channel_id: string,
    object_describe: ObjectDescribe,
  ) => {
    // console.log(
    //   `Executing setObjectDescribe(token: ${token}, channel_id: ${channel_id}, object_describe: ${JSON.stringify(object_describe)})`,
    // );
    const client = SlackAPI(token, {});
    const put_response = await client.apps.datastore.put({
      datastore: "object_describe_datastore",
      item: {
        id: channel_id.toLowerCase() + "___" +
          object_describe.name.toLowerCase(),
        channel_id: channel_id,
        sobject: object_describe.name,
        describe: JSON.stringify(object_describe),
      },
    });

    if (!put_response.ok) {
      console.log(`Error calling apps.datastore.put: ${put_response.error}`);
      throw new Error(put_response.error);
    }
  };
}
