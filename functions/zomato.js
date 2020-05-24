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
  return request(getOptions("/cuisines", (headers = { lat: lat ? lat : defaultLat, lon: long ? long : defaultLong })))
    .then((res) => {
      let cuisines = [];
      res.cuisines.forEach((cuisine) => {
        cuisines.push(cuisine["cuisine"]["cuisine_name"]);
      });
      return cuisines;
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  getCuisines: getCuisines,
};
