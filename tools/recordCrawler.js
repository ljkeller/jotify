// Identify, bundle, and record all the data from sc jail website

const Database = require('better-sqlite3');

const { setupDbCloseConditions, createTables, serializeInmateAggregate } = require("./database/sqliteUtils");
const { config } = require("./config");
const { getLastNDaysLocal } = require("./dateUtils");
const { getListingsForDates } = require("./scraping/inmateScraper");

main();

async function main() {
  const dates = getLastNDaysLocal(config.lastNDays);

  const db = new Database(config.databaseFile, { verbose: console.log });
  setupDbCloseConditions(db);

  // eventually, we will want to crawl continuously
  try {
    createTables(db);
    const inmateListings = await getListingsForDates(dates);
    for (const inmate of inmateListings) {
      serializeInmateAggregate(db, inmate);
    }
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
    console.log("Finished building db.");
  }
}