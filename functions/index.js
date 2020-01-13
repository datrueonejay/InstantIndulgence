const functions = require('firebase-functions');
const app = require('./dialogflow').app;

exports.fulfillment = functions.https.onRequest(app);