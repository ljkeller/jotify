const sqlite3 = require("sqlite3").verbose();

const { getLast7DaysLocal } = require("./dateUtils");
const { getInmatesForDates } = require("./scraping/inmateScraper");

async function main() {
  let last7Days = getLast7DaysLocal();
  const db = new sqlite3.Database(":memory:");

  try {
    const inmates = await getInmatesForDates(last7Days);
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
