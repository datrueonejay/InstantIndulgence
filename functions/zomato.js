const request = require("request-promise");
const { ZOMATO_URL, ZOMATO_KEY } = require("./constants");

// Default coordinates for Toronto
let defaultLat = 43.6532;
let defaultLong = -79.3832;

// TODO: Move and deploy zomato calls to backend api, also add redis cache
// TODO: Replace request with axios, handle zomato call failures
// TODO: Parse and clean requests

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

// Get a page of restaurants with id, name, address, image, rating
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
      let ret = [];
      restaurants.forEach((info) => {
        // TODO: Cache restaurant info
        let restaurant = info.restaurant;
        console.log(`feat is ${restaurant.featured_image} and thumb is ${restaurant.thumb}`);
        ret.push({
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.location.address,
          image: restaurant.featured_image,
          rating: restaurant.user_rating.aggregate_rating,
        });
      });
      console.log(ret);
      return ret;
    })
    .catch((err) => {
      throw err;
    });
};

// Get restaurant info
const getRestaurantInfo = (resId) => {
  // TODO: Set up and check cache
  return request(getOptions("/restaurant", (queryStrings = { res_id: resId })))
    .then((info) => {
      // TODO: Cache info
      return {
        id: info.id,
        name: info.name,
        address: info.location.address,
        url: info.url,
        image: info.featured_image,
        photosUrl: info.photos_url,
        menuUrl: info.menu_url,
        rating: info.user_rating.aggregate_rating,
        phone: info.phone_numbers,
        price: info.currency.repeat(parseInt(info.price_range)),
      };
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

module.exports = {
  getCuisines: getCuisines,
  getRestaurants: getRestaurants,
  getRestaurantInfo: getRestaurantInfo,
};
