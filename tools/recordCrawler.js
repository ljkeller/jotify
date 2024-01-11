// Identify, bundle, and record all the data from sc jail website

const Database = require('better-sqlite3');

const { config, scJailIoTableCreate } = require("./config");
const { getLastNDaysLocal } = require("./dateUtils");
const { getListings } = require("./scraping/inmateScraper");

main();

async function main() {
  const dates = getLastNDaysLocal(config.lastNDays);
  // eventually, we will want to crawl continuously

  const db = new Database(config.databaseFile, { verbose: console.log });
  setupDbCloseConditions(db);

  try {
    createTables(db);
    const listings = await getListings(dates);

    for (const listing of listings) {
    }
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
    console.log("Finished building db.");
  }
}

function setupDbCloseConditions(db) {
  process.on("exit", () => db.close());
  process.on("SIGHUP", () => process.exit(128 + 1));
  process.on("SIGINT", () => process.exit(128 + 2));
  process.on("SIGTERM", () => process.exit(128 + 15));
}

function createTables(db) {
  db.prepare(scJailIoTableCreate.inmate).run();
  db.prepare(scJailIoTableCreate.alias).run();
  db.prepare(scJailIoTableCreate.inmateAliasJunction).run();
  // Eventually, we should store images in S3
  // For now, we need to archive
  db.prepare(scJailIoTableCreate.img).run();
  db.prepare(scJailIoTableCreate.bondInformation).run();
  db.prepare(scJailIoTableCreate.chargeInformation).run();
}