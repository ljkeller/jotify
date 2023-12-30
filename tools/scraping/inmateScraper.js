const axios = require("axios");
const cheerio = require("cheerio");
const Inmate = require("../models/Inmate");

const config = require("../config");

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
  sleep(config.sleepBetweenRequests);

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

async function parseInmateTd($, td) {
  // Example row:
  // <tr>
  //     <th>Inmate Name (last, first, middle)</th>
  //     <th>Age</th>
  //     <th>Booking Date Time</th>
  //     <th>Release Date Time</th>
  //     <th>Arresting Agency</th>
  //     <th>Charges</th>
  // </tr>

  let imgUrl = $(td[0]).find("img").attr("src");
  if (imgUrl && imgUrl.startsWith("//")) {
    imgUrl = "https:" + imgUrl;
  }

  let inmateUrl = $(td[0]).find("a").attr("href");
  if (inmateUrl && inmateUrl.startsWith("?")) {
    // Dont duplicate '?' from href
    inmateUrl = config.baseInmateLink + inmateUrl.slice(1);
  }

  const age = $(td[1]).text().trim();
  // TODO: We should use datetimes
  const bookingDate = $(td[2]).text().trim();
  const releaseDate = $(td[3]).text().trim();
  const arrestingAgency = $(td[4]).text().trim();
  // TODO: Normalize charges
  const charges = $(td[5]).text().trim();

  let nameData = await getInmateNames(inmateUrl);

  if (nameData.firstName === "") {
    // Only expect this if we are being rate limited or something went wrong on
    // their end
    console.log("Error parsing inmate name from URL: ", inmateUrl);
  }

  return new Inmate(
    nameData.firstName,
    nameData.middleName,
    nameData.lastName,
    age,
    bookingDate,
    releaseDate,
    arrestingAgency,
    charges,
    imgUrl,
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
    const inmatesForDate = await getInmates(url);
    inmates = inmates.concat(inmatesForDate);

    await sleep(config.sleepBetweenRequests);
  }

  return inmates;
}

async function getInmates(inmateUrl) {
  return new Promise((resolve) => {
    const inmates = [];
    axios.get(inmateUrl).then(async (response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      console.log("Parsing inmates...");
      // First row is header, skip it
      const rows = $(".inmates-table tr").slice(1).toArray();
      for (const elem of rows) {
        const td = $(elem).find("td");
        let inmate = await parseInmateTd($, td);
        inmates.push(inmate);
      }

      console.log("Inmates size: ", inmates.length);
      resolve(inmates);
    });
  });
}

module.exports = { getInmatesForDates, getInmates, getInmateNames };
