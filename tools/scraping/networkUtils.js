const axios = require("axios");
const { config } = require("../config");

class NetworkUtils {
  static nextCommandTime = 0;

  static async respectfully_get(url) {
    const remainingDelay = Date.now() < NetworkUtils.nextCommandTime ? NetworkUtils.nextCommandTime - Date.now() : 0;
    await sleep(remainingDelay);

    NetworkUtils.nextCommandTime = Date.now() + config.sleepBetweenRequests;
    return axios.get(url);
  }

  static async respectfully_get_with_retry(url, remainingAttempts = 2) {
    try {
      return await NetworkUtils.respectfully_get(url);
    } catch (error) {
      if (remainingAttempts < 1) {
        throw new Error(`Failed to fetch. ${error}`);
      }
      return this.respectfully_get_with_retry(url, remainingAttempts - 1);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { NetworkUtils };