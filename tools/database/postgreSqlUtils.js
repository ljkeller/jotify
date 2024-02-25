const postgres = require('postgres');

const { postgresSchemas } = require('../config');
const { postgresConfig } = require('../secrets');

const CompressedInmate = require("../models/compressedInmate");
const ChargeInformation = require("../models/chargeInformation");
const BondInformation = require("../models/bondInformation");
const InmateProfile = require("../models/inmateProfile");
const InmateAggregate = require("../models/inmateAggregate");

function getClient() {
  return postgres(`postgres://${postgresConfig.username}:${postgresConfig.password}@${postgresConfig.ip}:${postgresConfig.port}`);
}

function setupDbCloseConditions(db) {
  // teardown is async so needs to happen before process.exit -> this is different from the sqlite version
  async function gracefulTeardown(exitCode) {
    console.log("Tearing down postgreSQL connection");
    await db.end({ timeout: 5 }).then(() => console.log("Teardown complete"));
    process.exit(exitCode);
  }

  process.on("SIGHUP", async () => gracefulTeardown(128 + 1));
  process.on("SIGINT", async () => gracefulTeardown(128 + 2));
  process.on("SIGTERM", async () => gracefulTeardown(128 + 15));
}

async function createTables(db) {
  const setupResult = await db.begin(sql => [
    sql.unsafe(postgresSchemas.inmate),
    sql.unsafe(postgresSchemas.alias),
    sql.unsafe(postgresSchemas.inmateAliasJunction),
    sql.unsafe(postgresSchemas.img),
    sql.unsafe(postgresSchemas.bondInformation),
    sql.unsafe(postgresSchemas.chargeInformation),
  ]);
  console.log('Initialized postgreSQL tables');
}

function serializeInmateAggregate(db, inmate) {
  try {
    // const addAggregate = db.transaction((inmate) => {
    //   const profile = inmate.inmateProfile;

    //   // The reason we can always insert all inmates is because the current
    //   // schema has a unique constraint across several columns. Thus,
    //   // duplicates will error out.
    //   let info = db.prepare(`
    //     INSERT INTO inmate
    //     VALUES
    //     (NULL, @first_name, @middle_name, @last_name, @affix, @permanent_id, @sex, @dob, @arresting_agency, @booking_date, @booking_number, @height, @weight, @race, @eye_color, NULL, @scil_sysid, 0)
    //   `).run(
    //     {
    //       first_name: profile.first,
    //       middle_name: profile.middle,
    //       last_name: profile.last,
    //       affix: profile.affix,
    //       permanent_id: profile.permanentId,
    //       sex: profile.sex,
    //       dob: profile.dob,
    //       arresting_agency: profile.arrestingAgency,
    //       booking_date: profile.bookingDateIso8601,
    //       booking_number: profile.bookingNumber,
    //       height: profile.height,
    //       weight: profile.weight,
    //       race: profile.race,
    //       eye_color: profile.eyeColor,
    //       scil_sysid: profile.scilSysId
    //     });
    //   const inmateId = info.lastInsertRowid;
    //   // TODO: insert image url once we're storing images in S3

    //   const aliasGetStmt = db.prepare(`
    //     SELECT id
    //     FROM alias
    //     WHERE alias = @alias
    //   `);
    //   const aliasInsertStmt = db.prepare(`
    //     INSERT INTO alias
    //     VALUES
    //     (NULL, @alias)
    //   `);
    //   const inmateAliasInsertStmt = db.prepare(`
    //     INSERT INTO inmate_alias
    //     VALUES
    //     (@inmate_id, @alias_id)
    //   `);

    //   // TODO: Investigate if make this a transaction
    //   for (const alias of profile.aliases) {
    //     if (!alias) {
    //       continue;
    //     }
    //     let info = null;
    //     let aliasQueryResp = aliasGetStmt.get({ alias });
    //     if (!aliasQueryResp) {
    //       info = aliasInsertStmt.run({ alias: alias });
    //     }
    //     inmateAliasInsertStmt.run({ inmate_id: inmateId, alias_id: aliasQueryResp ? aliasQueryResp.id : info.lastInsertRowid });
    //   }

    //   db.prepare(`
    //     INSERT INTO img
    //     VALUES
    //     (NULL, @inmate_id, @img_blob)
    //   `).run({
    //     inmate_id: inmateId,
    //     img_blob: profile.imgBlob
    //   });

    //   for (const bond of inmate.bondInformation) {
    //     db.prepare(`
    //       INSERT INTO bond
    //       VALUES
    //       (NULL, @inmate_id, @type, @amount_pennies)
    //     `).run({
    //       inmate_id: inmateId,
    //       type: bond.type,
    //       amount_pennies: bond.amountPennies
    //     });
    //   }

    //   for (const charge of inmate.chargeInformation) {
    //     db.prepare(`
    //       INSERT INTO charge
    //       VALUES
    //       (NULL, @inmate_id, @description, @grade, @offense_date)
    //     `).run({
    //       inmate_id: inmateId,
    //       description: charge.description,
    //       grade: charge.grade,
    //       offense_date: charge.offenseDate
    //     });
    //   }
    // });
    // addAggregate(inmate);
    console.log(inmate);
  } catch (error) {
    console.error(`Error serializing inmate: ${JSON.stringify(inmate.inmateProfile.getCoreAttributes(), null, 2)}. Error -> ${error}`);
  }
}

module.exports = { getClient, setupDbCloseConditions, createTables, serializeInmateAggregate }