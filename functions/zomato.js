const request = require("request-promise");
const { ZOMATO_URL, ZOMATO_KEY } = require("./constants");

// Default coordinates for Toronto
let defaultLat = 43.6532;
let defaultLong = -79.3832;

// TODO: Move and deploy zomato calls to backend api, also add redis cache

const CUISINES_PATH = "cuisines";

function getOptions(path, queryStrings, headers) {
  return {
    url: `${ZOMATO_URL}/${path}`,
    qs: {
      ...queryStrings,
    },
    headers: {
      "user-key": ZOMATO_KEY,
      ...headers,
    },
    json: true,
  };
}

const getCuisines = (lat, long) => {
  return request(
    getOptions("/cuisines", (queryStrings = { lat: lat ? lat : defaultLat, lon: long ? long : defaultLong }))
  )
    .then((res) => {
      let cuisines = {};
      res.cuisines.forEach((cuisine) => {
        let name = cuisine["cuisine"]["cuisine_name"];
        let id = cuisine["cuisine"]["cuisine_id"];
        cuisines[name] = id;
        // console.log(cuisine);
        // cuisines.push({
        //   name: cuisine["cuisine"]["cuisine_name"],
        //   id: cuisine["cuisine"]["cuisine_id"],
        // });
        // cuisines.push(cuisine["cuisine"]["cuisine_name"]);
      });
      return cuisines;
    })
    .catch((err) => {
      throw err;
    });
};

const getRestaurants = (lat, long, cuisineIds, page, count) => {
  let cuisines = "";
  cuisineIds.forEach((id) => {
    cuisines = cuisines.concat(`${id.toString()},`);
  });
  cuisines = cuisines.slice(0, -1);
  console.log(cuisines);
  return request(
    getOptions(
      "/search",
      (queryStrings = {
        lat: lat ? lat : defaultLat,
        lon: long ? long : defaultLong,
        cuisines: cuisines,
        start: page * count,
        count: count,
      })
    )
  )
    .then((res) => {
      let restaurants = res.restaurants;
      let names = [];
      let a = 0;
      restaurants.forEach((info) => {
        if (a === 0) {
          console.log(info.restaurant);
          a++;
        }
        let restaurant = info.restaurant;
        names.push(restaurant.name);
      });
      return names;
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  getCuisines: getCuisines,
  getRestaurants: getRestaurants,
};
