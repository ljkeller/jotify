const axios = require("axios");
const cheerio = require("cheerio");

const Inmate = require("../models/Inmate");
const { config } = require("../config");
const { scilDateTimeToIso8601 } = require("../dateUtils");

function getAliases(aliasesStr) {
  const noAlias = "no alias information";
  if (aliasesStr && aliasesStr.toLowerCase() !== noAlias) {
    try {
      return aliasesStr
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0);
    } catch (err) {
      console.log("Error parsing aliases: ", err);
      return [];
    }
  } else {
    return [];
  }
}

async function getInmateNames(inmateUrl) {
  // Maybe we should make a global rate limiter?
  // Really wish we could just have a static function wrapping axios.get
  await sleep(config.sleepBetweenRequests);

  const response = await axios.get(inmateUrl);
  const html = response.data;
  const $ = cheerio.load(html);

  let inmateData = {
    firstName: "",
    middleName: "",
    lastName: "",
    aliases: [],
  };

  $("dl.table-display")
    .children()
    .each((_, elem) => {
      if ($(elem).text().trim() === "First:") {
        inmateData.firstName = $(elem).next("dd").text().trim();
      } else if ($(elem).text().trim() === "Middle:") {
        inmateData.middleName = $(elem).next("dd").text().trim();
      } else if ($(elem).text().trim() === "Last:") {
        inmateData.lastName = $(elem).next("dd").text().trim();
      } else if ($(elem).text().trim().toLowerCase() === "alias(es):") {
        inmateData.aliases = getAliases($(elem).next("dd").text().trim());
      } else {
        // console.log("Unknown field: ", $(elem).text().trim());
      }
    });
  return inmateData;
}

async function getImgBlob(imgUrl) {
  if (!imgUrl) {
    return null;
  }

  async function attemptRequest(url, attempt = 1) {
    const maxAttempts = 3;
    const delay_mS = Math.pow(2, attempt) * 1000; // Exponential delay (2^attempt seconds)

    try {

      if (attempt > maxAttempts) {
        throw new Error(`Failed to fetch data after ${maxAttempts} attempts.`);
      }
      return await axios.get(imgUrl, {
        responseType: "arraybuffer",
      });

    } catch (error) {
      if (attempt <= maxAttempts) {
        console.log(`Request failed on attempt ${attempt}. Retrying in ${delay_mS}ms.`);
        console.log("Request url: ", imgUrl);
        await sleep(delay_mS);
        return await attemptRequest(url, attempt + 1);
      } else {
        console.error(error);
        throw new Error(`Failed to fetch data after ${maxAttempts} attempts.`);
      }
    }
  }

  // Maybe we should make a global rate limiter?
  // Really wish we could just have a static function wrapping axios.get
  await sleep(config.sleepBetweenRequests);
  const reponse = await attemptRequest(imgUrl);

  return reponse.data;
}

async function buildInmateFromTd($, td) {
  // Example row:
  // <tr>
  //     <th>Inmate Name (last, first, middle)</th>
  //     <th>Age</th>
  //     <th>Booking Date Time</th>
  //     <th>Release Date Time</th>
  //     <th>Arresting Agency</th>
  //     <th>Charges</th>
  // </tr>

  // TODO: Download and blob
  let imgUrl = $(td[0]).find("img").attr("src");
  if (imgUrl && imgUrl.startsWith("//")) {
    imgUrl = "https:" + imgUrl;
  }
  const imgBlob = await getImgBlob(imgUrl);

  let inmateUrl = $(td[0]).find("a").attr("href");
  if (inmateUrl && inmateUrl.startsWith("?")) {
    // Dont duplicate '?' from href
    inmateUrl = config.baseInmateLink + inmateUrl.slice(1);
  }

  const age = $(td[1]).text().trim();
  const bookingDateIso8601 = scilDateTimeToIso8601($(td[2]).text().trim());
  const arrestingAgency = $(td[4]).text().trim();
  // TODO: Do we want to normalize charges ?
  const charges = $(td[5]).text().trim();

  let nameData = await getInmateNames(inmateUrl);
  // Exponential backoff
  let retries = 3;
  let delay = 250;
  while (nameData.firstName === "" && retries > 0) {
    console.log(`Exponential backoff delay: ${delay} mS`);
    await sleep(delay);
    nameData = getInmateNames(inmateUrl);
    delay * 2;
    retries--;
  }

  if (nameData.firstName === "") {
    // Only expect this if we are being rate limited or something went wrong on
    // their end
    throw new Error(`Failed to parse inmate name from URL ${inmateUrl}`);
  }

  return new Inmate(
    nameData.firstName,
    nameData.middleName,
    nameData.lastName,
    age,
    bookingDateIso8601,
    arrestingAgency,
    charges,
    imgBlob,
    inmateUrl,
    nameData.aliases
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getInmatesForDates(dateArr) {
  let inmates = [];

  for (const date of dateArr) {
    const url = config.datelessInmatesUrl + date;
    let inmatesForDate;
    try {
      inmatesForDate = await getInmates(url);
    } catch (err) {
      console.error(err);
    }

    inmates = inmates.concat(inmatesForDate);
    await sleep(config.sleepBetweenRequests);
  }

  return inmates;
}

async function getInmates(inmateUrl) {
  async function attemptRequest(url, attempt = 1) {
    const maxAttempts = 3;
    const delay_mS = Math.pow(2, attempt) * 1000; // Exponential delay (2^attempt seconds)

    try {
      const response = await axios.get(url);

      if (response.data.includes("You are being redirected...") && attempt <= maxAttempts) {
        console.log(`We are being redireted. Retrying in ${delay_mS}ms.`);
        console.log(response.data);
        await sleep(delay_mS);
        return await attemptRequest(url, attempt + 1);
      } else if (attempt > maxAttempts) {
        throw new Error(`Failed to fetch data after ${maxAttempts} attempts.`);
      }
      return response;

    } catch (error) {
      if (attempt <= maxAttempts) {
        console.log(`Request failed on attempt ${attempt}. Retrying in ${delay_mS}ms.`);
        console.log("Request url: ", url);
        await sleep(delay_mS);
        return await attemptRequest(url, attempt + 1);
      } else {
        console.error(error);
        throw new Error(`Failed to fetch data after ${maxAttempts} attempts.`);
      }
    }
  }

  const inmates = [];
  const response = await attemptRequest(inmateUrl);

  const html = response.data;
  const $ = cheerio.load(html);

  console.log("Parsing inmates...");
  // First row is header, skip it
  const rows = $(".inmates-table tr").slice(1).toArray();
  for (const elem of rows) {
    const td = $(elem).find("td");

    let inmate = null;
    try {
      inmate = await buildInmateFromTd($, td);
    } catch (err) {
      console.error(err);
    }

    if (inmate !== null) {
      inmates.push(inmate);
    }
  }

  console.log("Inmates size: ", inmates.length);
  return inmates;
}

module.exports = { getInmatesForDates, getInmates, getInmateNames };
