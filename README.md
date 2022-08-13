# Slackforce

A simple app that sends messages to Slack based on changes in Salesforce. The app has a few parts and is still a little hacky until we support end user authentication. There are a few Workflows/Functions in this app.

## Connect
This is used to connect your Salesforce org with a channel in Slack. This only needs to be done once for each channel.

## Subscribe
This is used to subscribe to changes to a particular object in Salesforce. You can have as many subscriptions in a channel as you like.

## Refresh
This is an optional capability. Use this to refresh the object/layout metadata from Salesforce for all objects subscribed to in the channel.

## Manage
This is used to manage subscriptions associated with the channel. At the moment, this simply lets you delete existing subscriptions.