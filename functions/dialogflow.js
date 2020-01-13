const {
    dialogflow,
} = require('actions-on-google');

const app = dialogflow();

app.intent('Default Welcome Intent', (conv) => {
    conv.ask('Welcome to Instant Indulgence, from firebase');
});

exports.app = app;