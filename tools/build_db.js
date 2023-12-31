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

function createTables(db) {
  db.prepare(tableCreate.inmates).run();
  db.prepare(tableCreate.aliases).run();
  db.prepare(tableCreate.inmateAliasJunction).run();
}

function insertInmate(db, inmate) {
  return db.prepare(`
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
}

function insertAliases(db, aliases, inmateId) {
  let lastStatementInfo;

  let aliasInsert = db.prepare(`
        INSERT INTO ${tables.aliases}
        VALUES
        (NULL, ?)
  `)
  let aliasInmateJunctionInsert = db.prepare(`
        INSERT INTO ${tables.inmateAliasJunction}
        VALUES
        (?, ?)
  `)
  let aliasGet = db.prepare(`
    SELECT id FROM ${tables.aliases}
    WHERE alias = ?
  `)

  for (const alias of aliases) {
    let aliasId = null;
    try {
      let row = aliasGet.get(alias);
      if (row !== undefined) {
        console.log("Found duplicate alias. ID: ", row.id);
        aliasId = row.id;
      }
    } catch (err) {
      console.error(err);
      continue;
    }

    // alias already in alias table
    if (aliasId === null) {
      try {
        lastStatementInfo = aliasInsert.run(alias);
      } catch (err) {
        console.error(err);
        continue;
      }
      aliasId = lastStatementInfo.lastInsertRowid;
      console.log(`Inserted alias at rowId: ${aliasId}`);
    }

    try {
      lastStatementInfo = aliasInmateJunctionInsert.run(inmateId, aliasId);
    } catch (err) {
      console.error(err);
      continue;
    }
    if (lastStatementInfo.changes < 1) {
      console.error(`ERROR: inmate-alias relationship didn't insert to junction table correctly? ${inmateId}-${aliasId}`);
    }
  }
}

async function main() {
  const dates = getLastNDaysLocal(config.lastNDays);

  const db = new Database(config.databaseFile, { verbose: console.log });
  setupDbCloseConditions(db);

  try {
    const inmates = await getInmatesForDates(dates);
    createTables(db);

    for (const inmate of inmates) {
      let inmateId, lastStatementInfo;

      lastStatementInfo = insertInmate(db, inmate);
      inmateId = lastStatementInfo.lastInsertRowid;
      console.log(`Inserted inmate at rowId: ${inmateId}`);

      insertAliases(db, inmate.aliases, inmateId);
    }
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
    console.log("Finished building db.");
  }
}

main();