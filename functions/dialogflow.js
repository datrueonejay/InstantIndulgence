const { dialogflow, Permission, Confirmation } = require("actions-on-google");

const { getCuisines } = require("./zomato");

const app = dialogflow();

app.intent("Default Welcome Intent", (conv) => {
  conv.ask("Welcome to Instant Indulgence, from firebase");
  return conv.ask(
    new Permission({
      context: "To locate restaraunts near you",
      permissions: "DEVICE_PRECISE_LOCATION",
    })
  );
});

app.intent("Cuisines", (conv) => {
  if (conv.data.cuisines) {
    conv.ask(`Already found from before. The different cuisines are ${conv.data.cuisines}`);
    return;
  }

  let latitude = null;
  let longitude = null;

  if (conv.device.location) {
    ({ latitude, longitude } = conv.device.location.coordinates);
  }

  return getCuisines(latitude, longitude)
    .then((res) => {
      conv.data.cuisines = res;

      conv.ask(`The different cuisines are ${res}`);
      return;
    })
    .catch((err) => {
      throw err;
    });
});

app.intent("Location Intent", (conv, input) => {
  return conv.ask(
    new Permission({
      context: "To locate restaraunts near you",
      permissions: "DEVICE_PRECISE_LOCATION",
    })
  );
});

app.intent("Location Followup", (conv, input, granted) => {
  let latitude = null;
  let longitude = null;

  if (conv.device.location) {
    ({ latitude, longitude } = conv.device.location.coordinates);
  }
  return getCuisines(latitude, longitude)
    .then((res) => {
      // Store the cuisines near
      conv.data.cuisines = res;
      if (granted) {
        conv.ask("Great! Let's find some restaraunts near you!");
      } else {
        conv.ask(
          "No problem! If you do want to give your location for more accurate restaraunt recommendations, just let me know!"
        );
      }
      return;
    })
    .catch((err) => {
      throw err;
    });
});

app.intent("Goodbye", (conv) => {
  conv.close("Goodbye!");
});

app.catch((conv, error) => {
  console.error(error);
  conv.ask("Sorry there was a glitch. Can you say that again? From firebase");
});

app.intent("Default Fallback Intent", (conv) => {
  conv.ask(`I didn't understand. Can you try again? From firebase`);
});

exports.app = app;
