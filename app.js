const express = require('express')
const bodyParser = require('body-parser')

process.env.DEBUG = 'actions-on-google:*';
const DialogflowApp = require('actions-on-google').DialogflowApp;
const googleAssistantRequest = 'google';

const app = express()
var ebriteReq = require('request');

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 3000))

app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})

app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})

// Where dialog flow will connect to webhook
app.post('/webhook', function (request, response) {

	const EVENTBRITE_TOKEN = 'YOUR_UNIQUE_TOKEN';
	const SEARCH_default = "Kingston,Jamaica";

	// and some validation too
	if (!request.body || !request.body.result || !request.body.result.parameters) {
	return response.status(400).send('Bad Request')
	}

	// An action is a string used to identify what needs to be done in fulfillment
	let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters

	// Parameters are any entites that Dialogflow has extracted from the request.
	const parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters

	// Contexts are objects used to track and store conversation state
	const inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts

	// Get the request source (Google Assistant, Slack, API, etc) and initialize DialogflowApp
	const requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
	const eventApp = new DialogflowApp({request: request, response: response});


	// action handler to map webook functions to actions within the dialogflow console
	const actionHandlers = {
		'welcome': () => {
			if (requestSource === googleAssistantRequest) {
				sendResponse("Hey!get events in your area and other locations!"); // Send simple response to user
			}
			else{
				sendResponse("Hey!get events in your area and other locations!"); // Send simple response to user
			}
		},
		'getEvents': () => {

			const Check = parameters.LocationName;
			if(Check != "")
				SEARCH = Check;
			else
				SEARCH = SEARCH_default;

			let URL = 'https://www.eventbriteapi.com/v3/events/search/?token='+EVENTBRITE_TOKEN+'&q='+SEARCH;
			
			ebriteReq.get(URL,function(error, res, body) {
				if (!error && res.statusCode == 200) {
					body = JSON.parse(body);
					let webhookReply = {};
					webhookReply = parseEvent(body);
					response.json(webhookReply);
				 }
				 else{
					let webhookReply = "Sorry, the servers seems to be down";
					response.json(webhookReply);
				}
		        });
		},
		'input.unknown': () => {
			if (requestSource === googleAssistantRequest) {
				sendResponse( 'I\'m having trouble, can you try that again?'); // Send simple response to user
			}
			else
			{
				sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
			}
		},
		'default': () => {
			if (requestSource === googleAssistantRequest) {
				sendResponse("Default webhook message");
			}
			else
			{
				sendResponse("Default webhook message");
			}
		}
	};

	if (!actionHandlers[action]) {
		action = 'default';
	}

	eventApp.handleRequest(actionHandlers[action]);

	// Function to parse and return a facebook formatted response for cards which display individual event info.
	function parseEvent(eventData){

		const events = eventData.events;
		const length = events.length;
		let responseObject = {};
		
		responseObject.data ={'facebook': {
			'attachment': {
			  'type': 'template',
			  'payload': {
				'template_type': 'generic', 
				'elements': []
			  }
			}
		  }
		};
		
		// Only returning the first 10 results for page 1 on each user request
		for(let i = 0;i < 10;i++){
				let elem = {};
				elem = getFbElem(events[i]);
				responseObject.data.facebook.attachment.payload.elements.push(elem);
		}
		return  responseObject;
	}
	
	// Function to generate and return a facebook formatted "element" object. In this case a card element is generated.
	function getFbElem(event){

		let elementObj = {};
		elementObj.title = event.name.text;
		
		if(event.hasOwnProperty("logo")){
			if(event.logo != null){
				elementObj.image_url = event.logo.original.url;
			}
			else
				elementObj.image_url = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png';
		}
		else{
			elementObj.image_url = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png';
		}
		elementObj.subtitle = 'Top event in area !';

		let defaultActions = {}
		let actionType = "web_url";
		defaultActions.type = actionType;
		defaultActions.url = event.url;
		elementObj.default_action = defaultActions;

		let buttonList = [];
		let button = {};
		button.type = actionType;
		button.url = event.url;
		button.title = "Go";
		buttonList.push(button);
		elementObj.buttons = buttonList;
		return elementObj;
	}
	
	// Function to send correctly formatted responses to Dialogflow which are then sent to the user
	function sendResponse (responseToUser) {
     		 // if the response is a string send it as a response to the user
		if (typeof responseToUser === 'string') {
		  let responseJson = {};
		  responseJson.speech = responseToUser; // spoken response
		  responseJson.displayText = responseToUser; // displayed response
		  response.json(responseJson); // Send response to Dialogflow
		}
		else
		{
		  // If the response to the user includes rich responses or contexts send them to Dialogflow
		  let responseJson = {};

		  // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
		  responseJson.speech = responseToUser.speech || responseToUser.displayText;
		  responseJson.displayText = responseToUser.displayText || responseToUser.speech;

		  // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
		  responseJson.data = responseToUser.richResponses;

		  // Optional: add contexts (https://dialogflow.com/docs/contexts)
		  responseJson.contextOut = responseToUser.outputContexts;

		  response.json(responseJson); // Send response to Dialogflow
		}
	}
})


// Response formats for reference
const richResponses = {
	  'google': {
		'expectUserResponse': true,
		'isSsml': false,
		'noInputPrompts': [],
		'richResponse': {
		  'items': [
			{
			  'simpleResponse': {
				'textToSpeech': 'This is a simple speech response for Actions on Google.',
				'displayText': 'This is a simple display text response for Action on Google.'
			  }
			},
			{
			  'basicCard': {
				'title': 'Title: this is a title',
				'subtitle': 'This is a subtitle',
				'formattedText': 'This is a basic card.  Text in a basic card can include \'quotes\' and most other unicode characters including emoji 📱.  Basi cards also support some markdown formatting like *emphasis* or _italics_, **strong** or __bold__, and ***bold itallic*** or ___strong emphasis___ as well as other things like line  \nbreaks',
				'image': {
				  'url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
				  'accessibilityText': 'Image alternate text'
				},
				'buttons': [
				  {
					'title': 'This is a button',
					'openUrlAction': {
					  'url': 'https://assistant.google.com/'
					}
				  }
				]
			  }
			}
		  ]
		}
	  },
	  'slack': {
		'text': 'This is a text response for Slack.',
		'attachments': [
		  {
			'title': 'Title: this is a title',
			'title_link': 'https://assistant.google.com/',
			'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
			'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
			'fallback': 'This is a fallback.'
		  }
		]
	  },
	  'facebook': {
		'attachment': {
		  'type': 'template',
		  'payload': {
			'template_type': 'generic',
			'elements': [
			  {
				'title': 'Title: this is a title',
				'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
				'subtitle': 'This is a subtitle',
				'default_action': {
				  'type': 'web_url',
				  'url': 'https://assistant.google.com/'
				},
				'buttons': [
				  {
					'type': 'web_url',
					'url': 'https://assistant.google.com/',
					'title': 'This is a button'
				  }
				]
			  }
			]
		  }
		}
	  }
	};


app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})
