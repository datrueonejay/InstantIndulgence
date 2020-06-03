const { dialogflow, Permission, List } = require("actions-on-google");

const { getCuisines, getRestaurants } = require("./zomato");

const app = dialogflow();

app.intent("Default Welcome Intent", (conv) => {
  conv.ask("Welcome to Instant Indulgence, from firebase");
  return conv.ask(
    new Permission({
      context: "To locate restaurants near you",
      permissions: "DEVICE_PRECISE_LOCATION",
    })
  );
});

// app.intent("Cuisines", (conv) => {
//   if (conv.data.cuisines) {
//     conv.ask(`Already found from before. The different cuisines are ${conv.data.cuisines}`);
//     return;
//   }

//   let latitude = null;
//   let longitude = null;

//   if (conv.device.location) {
//     ({ latitude, longitude } = conv.device.location.coordinates);
//   }

//   return getCuisines(latitude, longitude)
//     .then((res) => {
//       conv.data.cuisines = res;

//       conv.ask(`The different cuisines are ${res}`);
//       return;
//     })
//     .catch((err) => {
//       throw err;
//     });
// });

app.intent("Add Cuisine", (conv, params) => {
  let cuisines = params.cuisine;

  // Save cuisines that are valid
  let success = [];
  let ids = conv.data.search ? conv.data.search : [];
  // console.log(conv.data.cuisines);
  cuisines.forEach((cuisine) => {
    // Check that cuisine is valid
    if (cuisine in conv.data.cuisines) {
      // Add to search criteria
      ids.push(conv.data.cuisines[cuisine]);
      success.push(cuisine);
    }
  });
  console.log(ids);
  conv.data.ids = ids;
  if (success.length == 0) {
    return conv.ask("Could not add any of the given types of food, try others.");
  }
  return conv.ask(`Successfully added ${success} to your search criteria.`);
});

app.intent("Find Restaurants", (conv, input) => {
  if (!conv.data.ids || conv.data.ids.length === 0) {
    return conv.ask("Looks like you haven't added any cuisines yet!");
  }

  let latitude = null;
  let longitude = null;

  if (conv.device.location) {
    ({ latitude, longitude } = conv.device.location.coordinates);
  }

  return getRestaurants(latitude, longitude, conv.data.ids ? conv.data.ids : [], 1, 10).then((res) => {
    // console.log(res);
    conv.ask(`Some restaurants near you are`);
    return conv.ask(listFormatter(res));
  });
});

app.intent("Location Intent", (conv, input) => {
  return conv.ask(
    new Permission({
      context: "To locate restaurants near you",
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
        conv.ask("Great! Let's find some restaurants near you!");
      } else {
        conv.ask(
          "No problem! If you do want to give your location for more accurate restaurant recommendations, just let me know!"
        );
      }
      return;
    })
    .catch((err) => {
      console.error(err);
      return conv.close("Sorry, we do not have restaurant data for your location.");
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

// Turn a list of strings into a list for dialogflow response
const listFormatter = (items) => {
  let newItems = {};
  items.forEach((item) => {
    newItems[item] = { title: item };
  });
  return new List({
    items: newItems,
  });
};

exports.app = app;
