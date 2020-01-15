const { dialogflow, Permission, Confirmation } = require("actions-on-google");

const { getCuisines } = require("./zomato");

const app = dialogflow();

app.intent("Default Welcome Intent", conv => {
  conv.ask("Welcome to Instant Indulgence, from firebase");
  conv.ask(
    new Permission({
      context: "To locate restaraunts near you.",
      permissions: "DEVICE_PRECISE_LOCATION"
    })
  );
});

app.intent("Cuisines", conv => {
  if (conv.data.cuisines) {
    conv.ask(`Already found from before. The different cuisines are ${conv.data.cuisines}`);
    return;
  }

  // Default coordinates for Toronto
  let latitude = 43.6532;
  let longitude = -79.3832;

  if (conv.device.location) {
    ({ latitude, longitude } = conv.device.location.coordinates);
  }
  console.log(latitude);
  console.log(longitude);

  return getCuisines(latitude, longitude)
    .then(res => {
      conv.data.cuisines = res;

      conv.ask(`The different cuisines are ${res}`);
      return;
    })
    .catch(err => {
      throw err;
    });
});

app.intent("Location", (conv, input, granted) => {
  if (granted) {
    conv.ask("Great! Let's find some restaraunts near you!");
    console.log(conv.device.location);
  } else {
    conv.ask(
      "No problem! If you do want to give your location for more accurate restaraunt recommendations, just let me know!"
    );
    console.log(conv.device.location);
  }
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
