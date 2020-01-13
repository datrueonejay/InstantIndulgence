const functions = require('firebase-functions');

const env = functions.config().constants;

const ZOMATO_URL = env.zomato_url;
const ZOMATO_KEY = env.zomato_key;

module.exports = {
    ZOMATO_URL: ZOMATO_URL,
    ZOMATO_KEY: ZOMATO_KEY
}