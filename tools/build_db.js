const sqlite3 = require("sqlite3").verbose();

const config = require("./config");
const { getLast7DaysLocal } = require("./dateUtils");
const {
  getInmatesForDates,
  getInmateNames,
} = require("./scraping/inmateScraper");

const url =
  "https://www.scottcountyiowa.us/sheriff/inmates.php?sysid=21799142502689";

async function main() {
  console.log(await getInmateNames(url));

  const dates = config.limitedCrawl ? ["today"] : getLast7DaysLocal();
  const db = new sqlite3.Database(":memory:");
  try {
    const inmates = await getInmatesForDates(dates);
    db.serialize(() => {
      db.run(`
              CREATE TABLE IF NOT EXISTS Inmates (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  firstName TEXT,
                  middleName TEXT,
                  lastName TEXT,
                  age INTEGER,
                  bookingDate TEXT,
                  releaseDate TEXT,
                  arrestingAgency TEXT,
                  charges TEXT,
                  imgUrl TEXT,
                  inmateUrl TEXT
              )
          `);
      const stmt = db.prepare(`
                  INSERT INTO Inmates
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
          inmate.inmateUrl
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
