const postgres = require('postgres');

const { getClient: getSqlClient, setupDbCloseConditions, createTables, serializeInmateAggregate } = require('../database/postgreSqlUtils');
const { getListingsForDates } = require('../scraping/inmateScraper');

const sql = getSqlClient();

async function main() {
  try {
    await createTables(sql);
    setupDbCloseConditions(sql);
    const inmateListings = await getListingsForDates(['today']);
    for (const inmate of inmateListings) {
      await serializeInmateAggregate(sql, inmate);
    }
  } catch (err) {
    console.log(err);
  } finally {
    sql.end();
  }
  return;
}

main();