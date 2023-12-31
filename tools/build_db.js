const Database = require('better-sqlite3');

const { config, tableCreate, tables } = require("./config");
const { getLastNDaysLocal } = require("./dateUtils");
const { getInmatesForDates } = require("./scraping/inmateScraper");

function setupDbCloseConditions(db) {
  process.on("exit", () => db.close());
  process.on("SIGHUP", () => process.exit(128 + 1));
  process.on("SIGINT", () => process.exit(128 + 2));
  process.on("SIGTERM", () => process.exit(128 + 15));
}

async function main() {
  const dates = getLastNDaysLocal(config.lastNDays);

  const db = new Database(config.databaseFile, { verbose: console.log });
  setupDbCloseConditions(db);

  try {
    const inmates = await getInmatesForDates(dates);
    db.prepare(tableCreate.inmates).run();
    db.prepare(tableCreate.aliases).run();
    db.prepare(tableCreate.inmateAliasJunction).run();

    for (const inmate of inmates) {
      let inmateId, aliasId, lastStatementInfo;

      lastStatementInfo = db.prepare(`
        INSERT INTO ${tables.inmates}
        VALUES
        (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([inmate.firstName,
      inmate.middleName,
      inmate.lastName,
      inmate.age,
      inmate.bookingDate,
      inmate.releaseDate,
      inmate.arrestingAgency,
      inmate.charges,
      inmate.imgUrl,
      inmate.url]);

      if (lastStatementInfo.changes < 1) {
        console.error("ERROR: Inmate insert didn't append new row?");
        continue;
      }

      inmateId = lastStatementInfo.lastInsertRowid;
      console.log(`Inserted inmate at rowId: ${inmateId}`);

      let aliasStatement = db.prepare(`
        INSERT INTO ${tables.aliases}
        VALUES
        (NULL, ?)
      `)
      for (const alias of inmate.aliases) {
        lastStatementInfo = aliasStatement.run(alias);

        if (lastStatementInfo.changes < 1) {
          console.error("ERROR: Alias insert didn't append new row?");
        }
        aliasId = lastStatementInfo.lastInsertRowid;
        console.log(`Inserted alias at rowId: ${aliasId}`);
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
    console.log("Finished building db.");
  }
}

main();
