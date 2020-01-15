const request = require("request-promise");
const { ZOMATO_URL, ZOMATO_KEY } = require("./constants");

const CUISINES_PATH = "cuisines";

function getOptions(path, queryStrings, headers) {
  return {
    url: `${ZOMATO_URL}/${path}`,
    qs: {
      ...queryStrings
    },
    headers: {
      "user-key": ZOMATO_KEY,
      ...headers
    },
    json: true
  };
}

const getCuisines = (lat, long) => {
  return request(getOptions("/cuisines", (headers = { lat: lat, lon: long })))
    .then(res => {
      let cuisines = [];
      res.cuisines.forEach(cuisine => {
        console.log(cuisine);
        cuisines.push(cuisine["cuisine"]["cuisine_name"]);
      });
      console.log("CUISINES ARE");
      console.log(cuisines);
      return cuisines;
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
  getCuisines: getCuisines
};
