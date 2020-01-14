const { dialogflow } = require("actions-on-google");

const { getCuisines } = require("./zomato");

const app = dialogflow();

app.intent("Default Welcome Intent", conv => {
  conv.ask("Welcome to Instant Indulgence, from firebase");
});

app.intent("Cuisines", conv => {
  return getCuisines(1, 1)
    .then(res => {
      conv.ask(`The different cuisines are ${res}`);
      return;
    })
    .catch(err => {
      throw err;
    });
});

app.intent("Goodbye", conv => {
  conv.close("Goodbye!");
});

app.catch((conv, error) => {
  console.error(error);
  conv.ask("Sorry there was a glitch. Can you say that again? From firebase");
});

app.intent("Default Fallback Intent", conv => {
  conv.ask(`I didn't understand. Can you try again? From firebase`);
});

exports.app = app;
