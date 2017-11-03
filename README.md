# Dialogflow-and-Node.js-webhook
Dialogflow event app which connects to a Node.js webhook.

This demo app pulls event data from https://www.eventbrite.com/. Sign up and obtain your own api token, 
then use it to replace the token in the app.js file.

Set up your dialogflow agent with the default intents :
https://dialogflow.com/

default welcome intent -> action : welcome. events intent -> action : getEvents.
note : you can change these to correspond to the action names of your choice in the app.js file.

Setting up local server :
In root directory, run npm install.
Download and run the ngrok tool for local development, as you need a public url for dialogflow to connect to webhook.https://ngrok.com/

Running :
node app.js

