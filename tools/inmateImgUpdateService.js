const Database = require('better-sqlite3');

const { config } = require('./config');
const { getImgBlobWithFallback } = require('./scraping/inmateScraper');
const { getInmateIdsWithNullImages, setupDbCloseConditions } = require('./database/sqliteUtils');

async function findAndRepairNullImgInmates() {
  const db = new Database(config.databaseFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
  // TODO: Don't define close conditions when used as a service?
  setupDbCloseConditions(db);
  const inmateIdSysIdPair = getInmateIdsWithNullImages(db);
  console.log("Inmate ids with null images:", inmateIdSysIdPair);
  for (const { id, scil_sysid } of inmateIdSysIdPair) {
    if (scil_sysid === null) {
      continue;
    }

    // TODO! What type is this? Should we convert to string isntead of relying on coersion?
    const fullInmateUrl = config.baseInmateLink + scil_sysid;
    const { data } = await NetworkUtils.respectfully_get_with_retry(fullInmateUrl);
    const $ = cheerio.load(data);
    const imgBlob = await getImgBlobWithFallback($);

    console.log(imgBlob);
    // TODO: update img blob
  }
  db.close();
  console.log("Finished repairing null images where possible.")
}

findAndRepairNullImgInmates();