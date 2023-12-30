const sqlite3 = require("sqlite3").verbose();

const { getLast7DaysLocal } = require("./dateUtils");
const { getInmatesForDates } = require("./scraping/inmateScraper");

const url =
  "https://www.scottcountyiowa.us/sheriff/inmates.php?sysid=21799142502689";

function getAliases(aliasesStr) {
  if (aliasesStr) {
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
  const axios = require("axios");
  const cheerio = require("cheerio");

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

async function main() {
  console.log(await getInmateNames(url));

  //   let last7Days = getLast7DaysLocal();
  //   const db = new sqlite3.Database(":memory:");
  //   try {
  //     const inmates = await getInmatesForDates(last7Days);
  //     db.serialize(() => {
  //       db.run(`
  //             CREATE TABLE IF NOT EXISTS Inmates (
  //                 id INTEGER PRIMARY KEY AUTOINCREMENT,
  //                 firstName TEXT,
  //                 middleName TEXT,
  //                 lastName TEXT,
  //                 age INTEGER,
  //                 bookingDate TEXT,
  //                 releaseDate TEXT,
  //                 arrestingAgency TEXT,
  //                 charges TEXT,
  //                 imgUrl TEXT,
  //                 inmateUrl TEXT
  //             )
  //         `);
  //       const stmt = db.prepare(`
  //                 INSERT INTO Inmates
  //                 VALUES
  //                 (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  //       inmates.forEach((inmate) => {
  //         stmt.run(
  //           inmate.firstName,
  //           inmate.middleName,
  //           inmate.lastName,
  //           inmate.age,
  //           inmate.bookingDate,
  //           inmate.releaseDate,
  //           inmate.arrestingAgency,
  //           inmate.charges,
  //           inmate.imgUrl,
  //           inmate.inmateUrl
  //         );
  //         console.log("Inserting inmate: ", inmate);
  //       });
  //       stmt.finalize();
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     db.close();
  //     console.log("Finished building db.");
  //   }
}

main();
