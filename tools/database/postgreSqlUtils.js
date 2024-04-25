const postgres = require("postgres");

const { postgresSchemas } = require("../config");
const { postgresConfig } = require("../secrets");

const CompressedInmate = require("../models/compressedInmate");
const ChargeInformation = require("../models/chargeInformation");
const BondInformation = require("../models/bondInformation");
const InmateProfile = require("../models/inmateProfile");
const InmateAggregate = require("../models/inmateAggregate");

const psql = postgres(
  `postgres://${postgresConfig.username}:${postgresConfig.password}@${postgresConfig.ip}:${postgresConfig.port}`
);

function getClient() {
  return psql;
}

function end(sql) {
  sql.end();
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
  const setupResult = await db.begin((sql) => [
    sql.unsafe(postgresSchemas.inmate),
    sql.unsafe(postgresSchemas.alias),
    sql.unsafe(postgresSchemas.inmateAliasJunction),
    sql.unsafe(postgresSchemas.img),
    sql.unsafe(postgresSchemas.bondInformation),
    sql.unsafe(postgresSchemas.chargeInformation),
  ]);
  console.log("Initialized postgreSQL tables");
}

async function insertAliasAndGetId(db, alias) {
  const [aliasObj] = await db`
    INSERT INTO alias
      (id, alias)
    VALUES
      (DEFAULT, ${alias})
    ON CONFLICT (alias) DO UPDATE
      SET alias = EXCLUDED.alias
    RETURNING id
  `
  return aliasObj.id;
}

async function serializeInmateAggregate(db, inmate) {
  try {
    await db.begin(async db => {
      const profile = inmate.inmateProfile;

      const [insertedInmate] = await db`
        INSERT INTO inmate
          (
           first_name, middle_name, last_name, affix, permanent_id,
           sex, dob, arresting_agency, booking_date, booking_number, 
           height, weight, race, eye_color, img_url, scil_sysid,
           record_visits, shared
          )
        VALUES
          (
           ${profile.first}, ${profile.middle}, ${profile.last},
           ${profile.affix}, ${profile.permanentId}, ${profile.sex},
           ${profile.dob}, ${profile.arrestingAgency}, ${profile.bookingDateIso8601},
           ${profile.bookingNumber}, ${profile.height}, ${profile.weight},
           ${profile.race}, ${profile.eyeColor}, NULL, ${profile.scilSysId}, 0, 0
          )
        RETURNING id, first_name
      `
      const inmateId = insertedInmate.id;
      for (const alias of profile.aliases) {
        if (!alias) {
          continue;
        }

        // Make this a prepared statement?
        const aliasId = await insertAliasAndGetId(db, alias);
        await db`
          INSERT INTO inmate_alias
            (inmate_id, alias_id)
          VALUES
            (${inmateId}, ${aliasId})
        `;
      }

      await db`
        INSERT INTO img
          (inmate_id, img)
        VALUES
          (${inmateId}, ${profile.imgBlob})
      `

      // TODO: optimize looping insert
      for (const bond of inmate.bondInformation) {
        await db`
          INSERT INTO bond
            (inmate_id, type, amount_pennies)
          VALUES
            (${inmateId}, ${bond.type}, ${bond.amountPennies})
        `
      }
      
      // TODO: optimize looping insert
      for (const charge of inmate.chargeInformation) {
        await db`
        INSERT INTO charge
          (inmate_id, description, grade, offense_date)
        VALUES
          (${inmateId}, ${charge.description}, ${charge.grade}, ${charge.offenseDate})
        `
      }
    });
    // console.log(inmate);
  } catch (error) {
    console.error(
      `Error serializing inmate: ${JSON.stringify(
        inmate.inmateProfile.getCoreAttributes(),
        null,
        2
      )}. Error -> ${error}`
    );
  }
}

module.exports = {
  getClient,
  setupDbCloseConditions,
  createTables,
  serializeInmateAggregate,
  psql,
  end
};
