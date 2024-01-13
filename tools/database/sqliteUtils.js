const { scJailIoTableCreate } = require("../config");

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

function serializeInmateAggregate(db, inmateAggregate) {
  const profile = inmateAggregate.inmateProfile;
  db.transaction((inmateAggregate) => {
    let info = db.prepare(`
      INSERT INTO inmate
      VALUES
      (NULL, @first_name, @middle_name, @last_name, @affix, @permanent_id, @sex, @dob, @arresting_agency, @booking_date, @booking_number, @height, @weight, @race, @eye_color, @img_url)
    `).run(
      profile.first,
      profile.middle,
      profile.last,
      profile.affix,
      profile.permanentId,
      profile.sex,
      profile.dob,
      profile.arrestingAgency,
      profile.bookingDateIso8601,
      profile.bookingNumber,
      profile.height,
      profile.weight,
      profile.race,
      profile.eyeColor,
      NULL
    );
    const inmateId = info.lastInsertRowId;
    // TODO: insert image url once we're storing images in S3

    const aliasIds = [];
    for (const alias of profile.aliases) {
      // check if alias exists
      info = db.prepare(`
        INSERT INTO alias
        VALUES
        (NULL, @alias)
      `).run(alias);
      aliasIds.push(info.lastInsertRowId);
    }

    db.prepare(`
      INSERT INTO img
      VALUES
      (NULL, @inmate_id, @img_blob)
    `).run(
      inmateId,
      profile.imgBlob
    );

    for (const bond of inmateAggregate.bondInformation) {
      // check if exists first
      db.prepare(`
        INSERT INTO bond
        VALUES
        (NULL, @inmate_id, @type, @amount_pennies)
      `).run(
        inmateId,
        bond.type,
        bond.amountPennies
      );
    }

    for (const aliasId of aliasIds) {
      db.prepare(`
        INSERT INTO inmate_alias
        VALUES
        (@inmate_id, @alias_id)
      `).run(inmateId, aliasId);
    }

    for (const charge of inmateAggregate.chargeInformation) {
      db.prepare(`
        INSERT INTO charge
        VALUES
        (NULL, @inmate_id, @description, @grade, @offense_date)
      `).run(
        inmateId,
        charge.description,
        charge.grade,
        charge.offenseDate
      );
    }
  });
}

module.exports = { setupDbCloseConditions, createTables };