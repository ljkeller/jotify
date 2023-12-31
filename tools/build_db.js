const Database = require('better-sqlite3');

const { config, tableCreate, tables } = require("./config");
const { getLastNDaysLocal } = require("./dateUtils");
const { getInmatesForDates } = require("./scraping/inmateScraper");

async function main() {
  const dates = getLastNDaysLocal(config.lastNDays);
  const db = new Database(config.databaseFile, { verbose: console.log });
  // db.serialize();
  try {
    const inmates = await getInmatesForDates(dates);
    // db.serialize(function () {
    // db.run(tableCreate.inmates);
    // db.run(tableCreate.aliases);
    // db.run(tableCreate.inmateAliasJunction);

    for (const inmate of inmates) {
      //   let inmateId, aliasId;

      //   const inmateHandle = await run(db, `
      //   INSERT INTO ${tables.inmates}
      //   VALUES
      //   (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      // `, [inmate.firstName,
      //   inmate.middleName,
      //   inmate.lastName,
      //   inmate.age,
      //   inmate.bookingDate,
      //   inmate.releaseDate,
      //   inmate.arrestingAgency,
      //   inmate.charges,
      //   inmate.imgUrl,
      //   inmate.url]);

      //   console.log(inmateHandle);
      //   console.log(inmateHandle.lastID);

      // await db.run(`
      //     INSERT INTO ${tables.inmates}
      //     VALUES
      //     (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      //   `, [inmate.firstName,
      // inmate.middleName,
      // inmate.lastName,
      // inmate.age,
      // inmate.bookingDate,
      // inmate.releaseDate,
      // inmate.arrestingAgency,
      // inmate.charges,
      // inmate.imgUrl,
      // inmate.url],
      //   async function (err) {
      //     inmateId = this.lastID;
      //     // db.serialize(function () {
      //     if (err) {
      //       console.log(err);
      //       return;
      //     }

      //     console.log("Inserted inmate: ", inmate);
      //     console.log("inmateId: ", inmateId);
      //     console.log("rows affected: ", this.changes);

      //     for (const alias of inmate.aliases) {
      //       console.log(alias)
      //       await db.run(`
      //             INSERT INTO ${tables.aliases}
      //             VALUES
      //             (NULL, ?)
      //           `,
      //         alias,
      //         function (err) {
      //           if (err) {
      //             console.log(err);
      //             console.log("Failure for alias: ", alias);
      //             console.log("Failure for aliasId: ", aliasId);
      //             return;
      //           }

      //           aliasId = this.lastID;
      //           console.log("Inserted alias: ", alias);
      //           console.log("Inserted aliasId: ", aliasId);
      //         }
      //       )
      //     }
      //     // });
      //   });
    }
    // });
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
    console.log("Finished building db.");
  }
}

main();
