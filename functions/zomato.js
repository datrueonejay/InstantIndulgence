const request = require('request-promise');
const {
    ZOMATO_URL,
    ZOMATO_KEY
} = require('./constants');

const CUISINES_PATH = 'cuisines';

function getOptions(path, queryStrings, headers) {
    return {
        url: `${ZOMATO_URL}/${path}`,
        qs: {
            ...queryStrings
        },
        headers: {
            'user-key': ZOMATO_KEY,
            ...headers
        },
        json: true
    }
}

const getCuisines = (lat, long) => {
    return request(getOptions('/cuisines', headers = {lat: lat, lon: long}));
}

module.exports = {
    getCuisines: getCuisines
}