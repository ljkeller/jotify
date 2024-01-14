const { NetworkUtils } = require('./networkUtils');
const cheerio = require("cheerio");

const InmateAggregate = require("../models/inmateAggregate");
const InmateProfile = require("../models/inmateProfile");
const BondInformation = require("../models/bondInformation");
const ChargeInformation = require("../models/chargeInformation");

const { config } = require("../config");
const { dollarsToCents } = require("./currency");
const { scilDateTimeToIso8601 } = require("../dateUtils");

// Get a set of aliases from a string
// Example: "John Doe, Johnny Doe, Johny Doe" -> Set("John Doe", "Johnny Doe", "Johny Doe")
// Example: "No alias information" -> Set()
// Example: "" -> Set()
// Example: "john, jane, john" -> Set("john", "jane")
//! todo: write some unit tests
function getAliases(aliasesStr) {
  // instead of no alias, SC jail website uses "No alias information"
  const noAlias = "no alias information";
  if (aliasesStr && aliasesStr.toLowerCase() !== noAlias) {
    try {
      return new Set(aliasesStr
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0));
    } catch (err) {
      console.log("Error parsing aliases: ", err);
      return new Set();
    }
  } else {
    return new Set();
  }
}

async function getListingsForDates(dateArr) {
  let listingsForDates = [];
  for (const date of dateArr) {
    try {
      const listing = await getListingsForDate(date);
      listingsForDates = listingsForDates.concat(listing);
    } catch (err) {
      console.error(`Found ${err} when visiting ${date}. Skipping...`);
    }
  }
  return listingsForDates;
}

function getBondInformation($) {
  const bondInformation = [];
  $('.inmates-bond-table tbody tr').each((_, tr) => {
    const td = $(tr).find('td');
    const bondType = $(td[1]).text().trim();
    const bondAmount = $(td[2]).text().trim();
    bondInformation.push(new BondInformation(bondType, dollarsToCents(bondAmount)));
  });
  return bondInformation;
}

function getChargeInformation($) {
  let charges = [];
  // Header column td example (followed by index):
  // case # | Description | Grade | Severity | Offense Date | ... 
  //   0    |      1      |   2   |     3    |       4      | ...
  $(".inmates-charges-table tbody tr").each((_, tr) => {
    const td = $(tr).find("td");
    const description = $(td[1]).text().trim();
    const grade = $(td[2]).text().trim();
    const offenseDate = $(td[3]).text().trim();
    charges.push(new ChargeInformation(description, grade, offenseDate));
  });

  return charges;
}

function getCoreProfileData($) {
  const first = $('dt:contains("First:")').next('dd').text().trim();
  const middle = $('dt:contains("Middle:")').next('dd').text().trim();
  const last = $('dt:contains("Last:")').next('dd').text().trim();
  const affix = $('dt:contains("Affix:")').next('dd').text().trim();
  const permanentId = $('dt:contains("Permanent ID:")').next('dd').text().trim();
  const sex = $('dt:contains("Sex:")').next('dd').text().trim();
  // TODO! enforce date format
  const dob = $('dt:contains("Date of Birth:")').next('dd').text().trim();
  const height = $('dt:contains("Height:")').next('dd').text().trim();
  const weight = $('dt:contains("Weight:")').next('dd').text().trim();
  const race = $('dt:contains("Race:")').next('dd').text().trim();
  const eyeColor = $('dt:contains("Eye Color:")').next('dd').text().trim();
  const aliasPlaceholder = $('dt:contains("Alias(es):")').next('dd').text().trim();

  return {
    first: first,
    middle: middle,
    last: last,
    affix: affix,
    permanentId: permanentId,
    sex: sex,
    dob: dob,
    height: height,
    weight: weight,
    race: race,
    eyeColor: eyeColor,
    aliases: getAliases(aliasPlaceholder)
  };
}

function getIncarcerationInformation($) {
  return {
    arrestingAgency: $("dt:contains('Arresting Agency')").next('dd').text().trim(),
    bookingDate: scilDateTimeToIso8601($("dt:contains('Booking Date Time')").next('dd').text().trim()),
    bookingNum: $("dt:contains('Booking Number')").next('dd').text().trim()
  }
}

async function getImgBlob($) {
  const imgUrl = $('.inmates img').attr('src');
  if (!imgUrl) {
    return null;
  }

  try {
    const response = await NetworkUtils.respectfully_get_with_retry(imgUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}


async function getInmateProfile($) {
  const { first, middle, last, affix, permanentId, sex, dob, height, weight, race, eyeColor, aliases } = getCoreProfileData($);
  const { arrestingAgency, bookingDate, bookingNum } = getIncarcerationInformation($);
  const imgBlob = await getImgBlob($);

  return new InmateProfile(
    first,
    middle,
    last,
    affix,
    permanentId,
    sex,
    dob,
    arrestingAgency,
    bookingDate,
    bookingNum,
    height,
    weight,
    race,
    eyeColor,
    aliases,
    imgBlob
  );
}

async function buildInmateAggregate(inmateUrl) {
  const { data } = await NetworkUtils.respectfully_get_with_retry(inmateUrl);
  const $ = cheerio.load(data);

  const chargeInformation = getChargeInformation($, data);
  const bondInformation = getBondInformation($, data);
  const inmateProfile = await getInmateProfile($, data);
  return new InmateAggregate(inmateProfile, bondInformation, chargeInformation);
}

async function getListingsForDate(date, remainingAttempts = 2, backoffSeconds = 5) {
  const inmates = [];
  const response = await NetworkUtils.respectfully_get_with_retry(config.datelessInmatesUrl + date, remainingAttempts);

  const html = response.data;
  if (html.includes("You are being redirected") && remainingAttempts > 0) {
    return await getListingsForDate(date, remainingAttempts - 1, backoffSeconds * 2);
  } else if (html.includes("You are being redirected")) {
    throw new Error(`Failed to fetch data (redirected) after ${remainingAttempts} attempts.`);
  }
  const $ = cheerio.load(html);

  console.log("Parsing listing...");
  const rows = $(".inmates-table tr").slice(1).toArray();
  for (const tr of rows) {
    try {
      let relativeInmateUrl = $(tr).find("td").first().find("a").attr("href");
      if (relativeInmateUrl && relativeInmateUrl.startsWith("?")) {
        // Dont duplicate '?' from href
        const inmate = await buildInmateAggregate(config.baseInmateLink + relativeInmateUrl.slice(1))
        // console.log(inmate);
        inmates.push(inmate);
      }
      else {
        console.error(`Failed to parse tr for inmate url ${tr}`);
        continue;
      }
    } catch (err) {
      console.error(err);
      continue;
    }
  }

  return inmates;
}

module.exports = { getListingsForDates };
