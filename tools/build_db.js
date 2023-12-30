const sqlite3 = require("sqlite3").verbose();

const { config, tableCreate, tables } = require("./config");
const { getLastNDaysLocal } = require("./dateUtils");
const { getInmatesForDates } = require("./scraping/inmateScraper");

async function main() {
  const dates = getLastNDaysLocal(config.lastNDays);
  const db = new sqlite3.Database(config.databaseFile);
  try {
    const inmates = await getInmatesForDates(dates);
    db.serialize(() => {
      db.run(tableCreate.inmates);
      db.run(tableCreate.aliases);
      db.run(tableCreate.inmateAliasJunction);
      const stmt = db.prepare(`
                  INSERT INTO ${tables.inmates}
                  VALUES
                  (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      inmates.forEach((inmate) => {
        stmt.run(
          inmate.firstName,
          inmate.middleName,
          inmate.lastName,
          inmate.age,
          inmate.bookingDate,
          inmate.releaseDate,
          inmate.arrestingAgency,
          inmate.charges,
          inmate.imgUrl,
          inmate.url
        );
        console.log("Inserting inmate: ", inmate);
      });
      stmt.finalize();
    });
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
    console.log("Finished building db.");
  }
}

main();
