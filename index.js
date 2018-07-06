'use strict';

const ALEXA_APP_ID = 'amzn1.ask.skill.81f37def-70ac-4442-b9d6-bfecec6e63ba';
const projectId = 'dnd-wiki-ca7bd';
const sessionId = 'quickstart-session-id';
const languageCode = 'en';
let alexaSessionId = sessionId;

const AlexaSdk = require('alexa-sdk');

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// The text query request.
const request = {
    session: sessionPath,
    source: 'alexa',
    queryInput: {
        text: {
            text: 'hi',
            languageCode: languageCode,
        },
    },
};

// Send request and log result
function dialogflowBridge(input, self) {
    if (typeof input === 'string') {
        request.queryInput.text.text = input;
        input = request;
    }
    return sessionClient
        .detectIntent(input)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
}

function intentMachine(text, self) {
  request.queryInput.text.text = text;
  let dragonSays = dialogflowBridge(text, self);
  dragonSays.then(data => {
    let output = data[0].queryResult.webhookPayload.fields.alexa.structValue.fields.SSML.stringValue.replace(/<[^>]*>+/g, '');
    setAlexaSessionId(self.event.session.sessionId);
    self.emit(':ask', output, output);
  })
  .catch(err => {
      console.error('ERROR:', err);
  });
}

exports.handler = function(event, context) {
    var alexa = AlexaSdk.handler(event, context);
    alexa.appId = ALEXA_APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function() {
        intentMachine('hi', this);
    },
    'passIntent': function() {
      intentMachine(self.event.request.intent.slots.Text.value, this);
    },
    'AMAZON.CancelIntent': function() {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function() {
        this.emit('Unhandled');
    },
    'AMAZON.StopIntent': function() {
        intentMachine('stop', this);
    },
    'Unhandled': function() {
        intentMachine('qerwerwerwerwer', this);
    }
};


function setAlexaSessionId(sessionId) {
    if (sessionId.indexOf("amzn1.echo-api.session.") !== -1) {
        alexaSessionId = sessionId.split('amzn1.echo-api.session.').pop();
    } else {
        alexaSessionId = sessionId.split('SessionId.').pop();
    }
}
