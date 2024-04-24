// Run the scrape/serialize process on both sqlite and postgres and compare the results.
const postgres = require('postgres');

const {config} = require('../config');
const { getClient: getPostgresClient, setupDbCloseConditions: setupPostgresDbCloseConditions, createTables: createPostgresTables, serializeInmateAggregate: serializePostgresInmateAggregate, end: endPostgres } = require('../database/postgreSqlUtils');
const { getClient: getSqliteClient, createTables: createSqliteTables, serializeInmateAggregate: serializeSqliteInmateAggregate, setupDbCloseConditions: setupSqliteDbCloseConditions, end: endSqlite} = require('../database/sqliteUtils')
const { getListingsForDates } = require('../scraping/inmateScraper');
const { getLastNDaysLocal } = require("../dateUtils");

async function main() {
  const psql = getPostgresClient();
  const sqlite = getSqliteClient(config.prototypeFile);
  try {
    await createPostgresTables(psql);
    createSqliteTables(sqlite);

    setupPostgresDbCloseConditions(psql);
    setupSqliteDbCloseConditions(sqlite);
    const inmateListings = await getListingsForDates(getLastNDaysLocal(1));
    for (const inmate of inmateListings) {
      await serializePostgresInmateAggregate(psql, inmate);
      serializeSqliteInmateAggregate(sqlite, inmate);
    }
  } catch (err) {
    console.log(err);
  } finally {
    endPostgres(psql);
    endSqlite(sqlite);
  }
  return;
}

main();