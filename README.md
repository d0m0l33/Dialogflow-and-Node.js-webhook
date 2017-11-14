# Dialogflow-and-Node.js-webhook
Dialogflow event app which connects to a Node.js webhook.

This demo app pulls event data from https://www.eventbrite.com/. Sign up and obtain your own api token, 
then use it to replace the token in the app.js file.

<h2>Set up your dialogflow agent with the default intents</h2>
Log in to console https://dialogflow.com/ 
<ul>
  <li>default welcome intent -> action : welcome </li>
  <li>events intent -> action : getEvents </li>
</ul>
note : you can change these to correspond to the action names of your choice in the app.js file.

<h2>Setting up local server</h2> 
In root directory, run npm install.
Download and run the ngrok tool for local development, as you need a public url for dialogflow to connect to webhook https://ngrok.com/

<h2>Running</h2> 
node app.js

