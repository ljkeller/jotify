const Database = require('better-sqlite3');
const { formatISO } = require('date-fns');
const cheerio = require('cheerio');

const { config } = require('./config');
const { getImgBlobWithFallback } = require('./scraping/inmateScraper');
const { getInmateIdsWithNullImages, setupDbCloseConditions } = require('./database/sqliteUtils');
const { NetworkUtils } = require('./scraping/networkUtils');

async function findAndRepairNullImgInmates() {
  const db = new Database(config.databaseFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
  // TODO: Don't define close conditions when used as a service?
  setupDbCloseConditions(db);

  const curDate = new Date();
  const lastWeekDate = new Date();
  lastWeekDate.setDate(curDate.getDate() - 7);
  const inmateIdSysIdPair = getInmateIdsWithNullImages(db, formatISO(lastWeekDate, { representation: "date" }), formatISO(curDate, { representation: "date" }));
  console.log("Inmate ids with null images:", inmateIdSysIdPair);
  for (const { id, scil_sysid } of inmateIdSysIdPair) {
    if (scil_sysid === null) {
      console.log('no sysid for inmate, skipping image retrieval');
      continue;
    }

    // TODO! What type is this? Should we convert to string isntead of relying on coersion?
    const fullInmateUrl = config.baseInmateLink + scil_sysid;
    const data = await NetworkUtils.respectfully_get_with_retry(fullInmateUrl);
    const $ = cheerio.load(data);
    const imgBlob = await getImgBlobWithFallback($);

    console.log("imgblob: ", imgBlob != null);
    // TODO: update img blob
  }
  db.close();
  console.log("Finished repairing null images where possible.")
}

findAndRepairNullImgInmates();