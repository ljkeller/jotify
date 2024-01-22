const { scJailIoTableCreate } = require("../config");
const CompressedInmate = require("/tools/models/compressedInmate");
const ChargeInformation = require("/tools/models/chargeInformation");

function setupDbCloseConditions(db) {
  process.on("exit", () => db.close());
  process.on("SIGHUP", () => process.exit(128 + 1));
  process.on("SIGINT", () => process.exit(128 + 2));
  process.on("SIGTERM", () => process.exit(128 + 15));
}

function createTables(db) {
  db.prepare(scJailIoTableCreate.inmate).run();
  db.prepare(scJailIoTableCreate.alias).run();
  db.prepare(scJailIoTableCreate.inmateAliasJunction).run();
  // Eventually, we should store images in S3
  // For now, we need to archive
  db.prepare(scJailIoTableCreate.img).run();
  db.prepare(scJailIoTableCreate.bondInformation).run();
  db.prepare(scJailIoTableCreate.chargeInformation).run();
}

// Todo: optimize transactions / fallbacks
// Do we really want transaction canceled if one alias is bad?
function serializeInmateAggregate(db, inmate) {
  try {
    const addAggregate = db.transaction((inmate) => {
      const profile = inmate.inmateProfile;

      // The reason we can always insert all inmates is because the current
      // schema has a unique constraint across several columns. Thus,
      // duplicates will error out.
      let info = db.prepare(`
        INSERT INTO inmate
        VALUES
        (NULL, @first_name, @middle_name, @last_name, @affix, @permanent_id, @sex, @dob, @arresting_agency, @booking_date, @booking_number, @height, @weight, @race, @eye_color, NULL, @scil_sysid, 0)
      `).run(
        {
          first_name: profile.first,
          middle_name: profile.middle,
          last_name: profile.last,
          affix: profile.affix,
          permanent_id: profile.permanentId,
          sex: profile.sex,
          dob: profile.dob,
          arresting_agency: profile.arrestingAgency,
          booking_date: profile.bookingDateIso8601,
          booking_number: profile.bookingNumber,
          height: profile.height,
          weight: profile.weight,
          race: profile.race,
          eye_color: profile.eyeColor,
          scil_sysid: profile.scilSysId
        });
      const inmateId = info.lastInsertRowid;
      // TODO: insert image url once we're storing images in S3

      const aliasGetStmt = db.prepare(`
        SELECT id
        FROM alias
        WHERE alias = @alias
      `);
      const aliasInsertStmt = db.prepare(`
        INSERT INTO alias
        VALUES
        (NULL, @alias)
      `);
      const inmateAliasInsertStmt = db.prepare(`
        INSERT INTO inmate_alias
        VALUES
        (@inmate_id, @alias_id)
      `);

      // TODO: Investigate if make this a transaction
      for (const alias of profile.aliases) {
        if (!alias) {
          continue;
        }
        let info = null;
        let aliasQueryResp = aliasGetStmt.get({ alias });
        if (!aliasQueryResp) {
          info = aliasInsertStmt.run({ alias: alias });
        }
        inmateAliasInsertStmt.run({ inmate_id: inmateId, alias_id: aliasQueryResp ? aliasQueryResp.id : info.lastInsertRowid });
      }

      db.prepare(`
        INSERT INTO img
        VALUES
        (NULL, @inmate_id, @img_blob)
      `).run({
        inmate_id: inmateId,
        img_blob: profile.imgBlob
      });

      for (const bond of inmate.bondInformation) {
        db.prepare(`
          INSERT INTO bond
          VALUES
          (NULL, @inmate_id, @type, @amount_pennies)
        `).run({
          inmate_id: inmateId,
          type: bond.type,
          amount_pennies: bond.amountPennies
        });
      }

      for (const charge of inmate.chargeInformation) {
        db.prepare(`
          INSERT INTO charge
          VALUES
          (NULL, @inmate_id, @description, @grade, @offense_date)
        `).run({
          inmate_id: inmateId,
          description: charge.description,
          grade: charge.grade,
          offense_date: charge.offenseDate
        });
      }
    });
    addAggregate(inmate);

  } catch (error) {
    console.error(`Error serializing inmate: ${JSON.stringify(inmate.inmateProfile.getCoreAttributes(), null, 2)}. Error -> ${error}`);
  }
}

function getInmateIdsWithNullImages(db, startDateISO, endDateISO) {
  console.log("Getting inmates with null images between", startDateISO, " and ", endDateISO);
  return db.prepare(`
    SELECT inmate.id, inmate.scil_sysid
    FROM inmate
    JOIN img ON inmate.id = img.inmate_id
    WHERE img.img IS NULL AND
    date(inmate.booking_date) BETWEEN date(@starting_date) AND date(@ending_date)
  `).all({ starting_date: startDateISO, ending_date: endDateISO });
}

function countInmatesOnDate(db, iso8601DateStr) {
  return db.prepare(`
    SELECT COUNT(*)
    FROM inmate
    WHERE date(booking_date) = date(@iso8601DateStr)
  `).get({ iso8601DateStr })['COUNT(*)'];
}

function getCompressedInmateDataForDate(db, iso8601DateStr) {
  console.log(`Getting compressed inmate data for date ${iso8601DateStr}`);
  const inData = db.prepare(`
    SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
    FROM inmate
    WHERE date(booking_date) = date(@iso8601DateStr)
  `).all({ iso8601DateStr });

  const compressedInmates = [];
  for (const inmate of inData) {
    try {
      const charges = db.prepare(`
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = @inmate_id
      `).all({ inmate_id: inmate.id });
      const chargeInformationArray = charges.map((charge) => {
        return new ChargeInformation(charge.description, charge.grade, charge.offenseDate);
      });

      const bond = db.prepare(`
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = @inmate_id
      `).all({ inmate_id: inmate.id });
      let bondPennies = bond.reduce((acc, curr) => acc + curr.amount_pennies, 0);
      bondPennies = bond.some((bond) => bond.type.toLowerCase().includes('unbondable')) ? Infinity : bondPennies;

      const img = db.prepare(`
        SELECT img
        FROM img
        WHERE inmate_id = @inmate_id
      `).get({ inmate_id: inmate.id });

      const compressedInmate = new CompressedInmate(
        inmate.first_name,
        inmate.middle_name,
        inmate.last_name,
        inmate.affix,
        inmate.booking_date,
        bondPennies,
        inmate.dob,
        img.img,
        chargeInformationArray);
      compressedInmates.push(compressedInmate);
    } catch (err) {
      console.error(`Error getting compressed inmate data for inmate id ${inmate.id}. Error: ${err}`);
    }
  }
  return compressedInmates;
}

module.exports = { setupDbCloseConditions, createTables, serializeInmateAggregate, getInmateIdsWithNullImages, countInmatesOnDate, getCompressedInmateDataForDate };