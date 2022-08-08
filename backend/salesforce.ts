import {
  getObjectDescribe,
  getSettings,
  getSubscriptions,
  ObjectDescribe,
  ObjectDescribeField,
  ObjectDescribeFieldOption,
  setObjectDescribe,
  setSettings,
  Settings,
  Subscription,
} from "./storage.ts";
import { sendMessage } from "./slack.ts";
import { Schema } from "deno-slack-sdk/mod.ts";

export interface LayoutBlock {
  label: string;
  value: string;
  name: string;
  order: number;
}

export const getUpdatedObjectRecords = async (
  token: string,
  channel_id: string,
) => {
  console.log(
    `Executing getUpdatedObjectRecords(token: ${token}, channel_id: ${channel_id})`,
  );
  const settings: Settings = await getSettings(token, channel_id);
  const subscriptions: Subscription[] = await getSubscriptions(
    token,
    channel_id,
  );

  // Start with the last polled date and end with now
  const lastPolled = new Date().getTime();
  // const startDate = encodeURIComponent(
  //   new Date(Number(settings.last_polled)).toISOString(),
  // );
  // const endDate = encodeURIComponent(
  //   new Date().toISOString(),
  // );
  const startDate = "2022-08-05T00%3A00%3A00%2B00%3A00";
  const endDate = "2022-08-08T00%3A00%3A00%2B00%3A00";

  if (settings != null && subscriptions != null) {
    for (let x = 0; x < subscriptions.length; x++) {
      // Get the updated object records from Salesforce based on the time difference since the last query
      const updated_response = await fetch(
        `https://${settings.subdomain}.my.salesforce.com/services/data/v55.0/sobjects/${
          subscriptions[x].sobject
        }/updated/?start=${startDate}&end=${endDate}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${settings.session_id}`,
            "Content-Type": "application/json",
          },
        },
      );
      const updatedSObjectIds = await updated_response.json();
      console.log(
        `Changed objects since last poll: ${JSON.stringify(updatedSObjectIds)}`,
      );

      if (
        updatedSObjectIds != null && updatedSObjectIds.ids != null &&
        updatedSObjectIds.ids.length > 0
      ) {
        // Get the object description for this object so we can query Salesforce properly
        const sobjectDescribe: ObjectDescribe = await getObjectDescribe(
          token,
          channel_id,
          subscriptions[x].sobject,
        );

        // Get the layout for the object so we know how to render messages
        let sobjectLayout = null;
        if (sobjectDescribe.layout != null) {
          sobjectLayout = JSON.parse(sobjectDescribe.layout);
          if (
            sobjectLayout.fieldItems == null ||
            sobjectLayout.fieldItems.length == 0
          ) {
            console.log(`ObjectDescribe missing layout.fieldItems property`);
            throw new Error(
              "The object does not have an fields to show in the message",
            );
          }
        } else {
          console.log(`ObjectDescribe missing layout property`);
          throw new Error(
            "The object does not have a layout to render the message",
          );
        }

        // Construct the SOQL call
        let soql = "SELECT Id, ";
        if (
          sobjectDescribe != null && sobjectDescribe.fields != null &&
          sobjectDescribe.fields.length > 0
        ) {
          for (let y = 0; y < sobjectDescribe.fields.length; y++) {
            soql += `${sobjectDescribe.fields[y].name}, `;
          }
          soql = `${soql.substring(0, soql.length - 2)} FROM ${
            subscriptions[x].sobject
          } WHERE (`;

          // Add the changed objects to the soql
          for (let y = 0; y < updatedSObjectIds.ids.length; y++) {
            soql += `Id = '${updatedSObjectIds.ids[y]}' OR `;
          }
          soql = `${soql.substring(0, soql.length - 4)})`;

          // Add the filter criteria to the soql
          if (
            subscriptions[x].filters != null &&
            subscriptions[x].filters.length > 0
          ) {
            soql += " AND (";
            for (let y = 0; y < subscriptions[x].filters.length; y++) {
              // TODO Need to make sure the value is formatted correctly for the query - this currently
              // assumes the value is a number/boolean
              // TODO this also assumes an AND between criteria
              soql += `${subscriptions[x].filters[y].field} ${
                subscriptions[x].filters[y].comparison
              } ${subscriptions[x].filters[y].value} AND `;
            }
            soql = `${soql.substring(0, soql.length - 5)})`;
          }
          console.log(`Constructed SOQL query: ${soql}`);

          // Get the data for the records from Salesforce
          const query_response = await fetch(
            `https://${settings.subdomain}.my.salesforce.com/services/data/v55.0/query/?q=${soql}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${settings.session_id}`,
                "Content-Type": "application/json",
              },
            },
          );
          const updatedRecords = await query_response.json();
          // console.log(
          //   `Updated records based on ids: ${JSON.stringify(updatedRecords)}`,
          // );

          // Go through each of the records and send a message to channel using the layout
          if (
            updatedRecords != null && updatedRecords.records != null &&
            updatedRecords.records.length > 0
          ) {
            // Go through every record
            for (let y = 0; y < updatedRecords.records.length; y++) {
              const layoutBlocks: LayoutBlock[] = [];
              // But only render the fields that are in the layout
              for (let z = 0; z < sobjectLayout.fieldItems.length; z++) {
                // console.log(
                //   `Field item being rendered: ${
                //     JSON.stringify(sobjectLayout.fieldItems[z])
                //   }`,
                // );

                // Check to see if we have the data - we don't validate the layout against
                // Slack supported types (TODO)
                if (
                  updatedRecords
                    .records[y][
                      sobjectLayout.fieldItems[z].layoutComponents[0].details
                        .name
                    ]
                ) {
                  layoutBlocks.push({
                    name:
                      sobjectLayout.fieldItems[z].layoutComponents[0].details
                        .name,
                    label: sobjectLayout.fieldItems[z].label,
                    value: updatedRecords
                      .records[y][
                        sobjectLayout.fieldItems[z].layoutComponents[0]
                          .details.name
                      ],
                    order: updatedRecords
                      .records[y][
                        sobjectLayout.fieldItems[z].layoutComponents[0]
                          .tabOrder
                      ],
                  });
                }
              }
              // Sort in tab order
              layoutBlocks.sort((a, b) => a.order - b.order);
              // console.log(
              //   `Message content to be posted: ${JSON.stringify(layoutBlocks)}`,
              // );
              sendMessage(token, channel_id, sobjectDescribe, layoutBlocks);
            }
          }
        }
      } else {
        console.log("No changes found since last poll");
      }
    }

    // Update the last polled date in our settings
    settings.last_polled = lastPolled;
    await setSettings(token, settings);
  }
};

export const refreshObjectDescriptions = async (
  token: string,
  channel_id: string,
): Promise<ObjectDescribe[]> => {
  console.log(
    `Executing refreshObjectDescriptions(token: ${token}, channel_id: ${channel_id})`,
  );
  const settings: Settings = await getSettings(token, channel_id);
  const subscriptions: Subscription[] = await getSubscriptions(
    token,
    channel_id,
  );

  const objectDescribes: ObjectDescribe[] = [];

  if (settings != null && subscriptions != null) {
    for (let x = 0; x < subscriptions.length; x++) {
      // Get the description of the object fields
      const describe_response = await fetch(
        `https://${settings.subdomain}.my.salesforce.com/services/data/v55.0/sobjects/${
          subscriptions[x].sobject
        }/describe/`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${settings.session_id}`,
            "Content-Type": "application/json",
          },
        },
      );
      const sobjectDescribe = await describe_response.json();
      // console.log(
      //   `Object descriptions retrieved: ${JSON.stringify(sobjectDescribe)}`,
      // );

      // Get the description of the compact layout
      const compact_response = await fetch(
        `https://${settings.subdomain}.my.salesforce.com/services/data/v55.0/sobjects/${
          subscriptions[x].sobject
        }/describe/compactLayouts`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${settings.session_id}`,
            "Content-Type": "application/json",
          },
        },
      );
      const sobjectCompact = await compact_response.json();
      // console.log(
      //   `Object compact layouts retrieved: ${JSON.stringify(sobjectCompact)}`,
      // );

      let layout = null;
      if (
        sobjectCompact != null &&
        sobjectCompact.compactLayouts != null &&
        sobjectCompact.compactLayouts.length > 0
      ) {
        // First, look for a layout attributed to this app (must contain the word "poops")
        for (let y = 0; y < sobjectCompact.compactLayouts.length; y++) {
          if (
            sobjectCompact.compactLayouts[y].name.toLowerCase().indexOf(
              "poops",
            ) > 0
          ) {
            layout = sobjectCompact.compactLayouts[y];
            break;
          }
        }

        // If we didn't find a layout, grab the default one
        if (layout == null) {
          for (let y = 0; y < sobjectCompact.compactLayouts.length; y++) {
            if (
              sobjectCompact.compactLayouts[y].id ===
                sobjectCompact.defaultCompactLayoutId
            ) {
              layout = sobjectCompact.compactLayouts[y];
              break;
            }
          }
        }
      }
      // console.log(`The object layout is: ${JSON.stringify(layout)}`);

      if (
        sobjectDescribe != null &&
        sobjectDescribe.fields != null &&
        sobjectDescribe.fields.length > 0
      ) {
        const sobjectFields: ObjectDescribeField[] = [];

        for (let y = 0; y < sobjectDescribe.fields.length; y++) {
          // Translate Salesforce types to Slack types
          let include = false;
          let type = "";
          if (
            sobjectDescribe.fields[y].type.toLowerCase() === "string" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "email" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "picklist" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "phone" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "url" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "combobox"
          ) {
            type = Schema.types.string;
            include = true;
          } else if (
            sobjectDescribe.fields[y].type.toLowerCase() === "boolean"
          ) {
            type = Schema.types.boolean;
            include = true;
          } else if (
            sobjectDescribe.fields[y].type.toLowerCase() === "int" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "double" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "currency" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "percent"
          ) {
            type = Schema.types.number;
            include = true;
          } else if (
            sobjectDescribe.fields[y].type.toLowerCase() === "date" ||
            sobjectDescribe.fields[y].type.toLowerCase() === "datetime"
          ) {
            type = Schema.slack.types.timestamp;
            include = true;
          }

          if (include === true) {
            const options: ObjectDescribeFieldOption[] = [];

            if (
              sobjectDescribe.fields[y].picklistValues != null &&
              sobjectDescribe.fields[y].picklistValues.length > 0
            ) {
              for (
                let z = 0;
                z < sobjectDescribe.fields[y].picklistValues.length;
                z++
              ) {
                options.push({
                  value: sobjectDescribe.fields[y].picklistValues[z].value,
                });
              }
              sobjectFields.push({
                type: type,
                name: sobjectDescribe.fields[y].name,
                label: sobjectDescribe.fields[y].label,
                options: options,
              });
            } else {
              sobjectFields.push({
                type: type,
                name: sobjectDescribe.fields[y].name,
                label: sobjectDescribe.fields[y].label,
              });
            }
          }
        }

        // console.log(JSON.stringify(sobjectFields));
        const object_describe: ObjectDescribe = {
          name: subscriptions[x].sobject,
          fields: sobjectFields,
          layout: JSON.stringify(layout),
        };
        objectDescribes.push(object_describe);
        await setObjectDescribe(token, channel_id, object_describe);
      } else {
        console.log("No fields found");
      }
    }
  }
  return objectDescribes;
};
