const { dialogflow, Permission, List, BasicCard, Button } = require("actions-on-google");
const qs = require("querystring");

const { getCuisines, getRestaurants, getRestaurantInfo } = require("./zomato");

const app = dialogflow();

app.intent("Default Welcome Intent", (conv) => {
  conv.ask("Welcome to Instant Indulgence, from firebase powered by Zomato");
  conv.ask(
    new Permission({
      context: "To locate restaurants near you",
      permissions: "DEVICE_PRECISE_LOCATION",
    })
  );
});

// TODO: Parse and clean input

app.intent("Add Cuisine", (conv, params) => {
  // TODO: Don't read cuisines, also remove cuisine
  let cuisines = params.cuisine;

  // Save cuisines that are valid
  let success = [];

  // Stored as a list, but data is added as a set
  let ids = conv.data.ids ? new Set(conv.data.ids) : new Set();
  cuisines.forEach((cuisine) => {
    // Check that cuisine is valid
    if (cuisine in conv.data.cuisines) {
      // Add to search criteria
      ids.add(conv.data.cuisines[cuisine]);
      success.push(cuisine);
    }
  });
  conv.data.ids = Array.from(ids);
  if (success.length == 0) {
    return conv.ask("Could not add any of the given types of food, try others.");
  }
  return conv.ask(`Successfully added ${success} to your search criteria.`);
});

app.intent("Find Restaurants", (conv, input) => {
  if (!conv.data.ids || conv.data.ids.size === 0) {
    return conv.ask("Looks like you haven't added any cuisines yet!");
  }

  let latitude = null;
  let longitude = null;

  if (conv.device.location) {
    ({ latitude, longitude } = conv.device.location.coordinates);
  }

  return getRestaurants(latitude, longitude, conv.data.ids ? conv.data.ids : [], 1, 10).then((res) => {
    // Screen
    if (conv.screen) {
      // if (hasScreen(conv)) {
      conv.ask(`Here are some restaurants near you.`);
      return conv.ask(listFormatter(res));
    }
    // Audio only
    else {
      // TODO: Fix up if audio only
      conv.ask(`Some restaurants near you are ${res[0].name}`);
    }
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

app.intent("Select Restaurant", (conv, input, option) => {
  console.log(option);
  return getRestaurantInfo(option).then((info) => {
    let mapQuery = qs.escape(`${info.name} ${info.address}`);
    conv.ask(`Here's more information on ${info.name}`);
    return conv.ask(
      new BasicCard({
        buttons: [
          new Button({
            title: `Open in Maps`,
            url: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
          }),
          // Only One button is supported currently
          // new Button({
          //   title: `Open in Zomato`,
          //   url: info.url,
          // }),
        ],
        image: { url: info.image, accessibilityText: `Image for ${info.name}` },
        title: info.name,
        // subtitle: info.address,
        text: `Address: ${info.address}  \nPhone: ${info.phone}  \nRating: ${info.rating}/5  \nPrice Range: ${info.price}`,
      })
    );
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

// Check if current conv has a screen
const hasScreen = (conv) => {
  return conv.surface.capabilities.has("actions.capability.SCREEN_OUTPUT");
};

// Turn a list of restaurants into a list for dialogflow response
const listFormatter = (restaurants) => {
  let newItems = {};
  restaurants.forEach((restaurant) => {
    newItems[restaurant.id] = {
      title: restaurant.name,
      description: `${restaurant.address}`,
      image: {
        url: restaurant.image,
        accessibilityText: `Image for ${restaurant.name}`,
      },
      optionInfo: {
        key: restaurant.id,
      },
    };
  });
  return new List({
    items: newItems,
  });
};

exports.app = app;
