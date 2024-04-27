const { scJailIoTableCreate, config } = require("../config");

const CompressedInmate = require("../models/compressedInmate");

const ChargeInformation = require("../models/chargeInformation");
const BondInformation = require("../models/bondInformation");
const InmateProfile = require("../models/inmateProfile");
const InmateAggregate = require("../models/inmateAggregate");
const Database = require("better-sqlite3");

const INMATE_SORT_OPTIONS = new Map([
  ["name", "last_name"],
  ["date", "booking_date"],
  ["bond", "bond"],
  ["age", "dob"],
]);
const SORT_DIRECTIONS = new Set(["asc", "desc"]);

function getClient(filepath) {
  return new Database(filepath, {
    verbose: config.printDbQueries ? console.log : null,
  });
}

function end(sql) {
  sql.close();
}

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
      let info = db
        .prepare(
          `
        INSERT INTO inmate
        VALUES
        (NULL, @first_name, @middle_name, @last_name, @affix, @permanent_id, @sex, @dob, @arresting_agency, @booking_date, @booking_number, @height, @weight, @race, @eye_color, NULL, @scil_sysid, 0)
      `
        )
        .run({
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
          scil_sysid: profile.scilSysId,
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
        inmateAliasInsertStmt.run({
          inmate_id: inmateId,
          alias_id: aliasQueryResp ? aliasQueryResp.id : info.lastInsertRowid,
        });
      }

      db.prepare(
        `
        INSERT INTO img
        VALUES
        (NULL, @inmate_id, @img_blob)
      `
      ).run({
        inmate_id: inmateId,
        img_blob: profile.imgBlob,
      });

      for (const bond of inmate.bondInformation) {
        db.prepare(
          `
          INSERT INTO bond
          VALUES
          (NULL, @inmate_id, @type, @amount_pennies)
        `
        ).run({
          inmate_id: inmateId,
          type: bond.type,
          amount_pennies: bond.amountPennies,
        });
      }

      for (const charge of inmate.chargeInformation) {
        db.prepare(
          `
          INSERT INTO charge
          VALUES
          (NULL, @inmate_id, @description, @grade, @offense_date)
        `
        ).run({
          inmate_id: inmateId,
          description: charge.description,
          grade: charge.grade,
          offense_date: charge.offenseDate,
        });
      }
    });
    addAggregate(inmate);
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

function getInmateIdsWithNullImages(db, startDateISO, endDateISO) {
  console.log(
    "Getting inmates with null images between",
    startDateISO,
    " and ",
    endDateISO
  );
  return db
    .prepare(
      `
    SELECT inmate.id, inmate.scil_sysid
    FROM inmate
    JOIN img ON inmate.id = img.inmate_id
    WHERE img.img IS NULL AND
    date(inmate.booking_date) BETWEEN date(@starting_date) AND date(@ending_date)
  `
    )
    .all({ starting_date: startDateISO, ending_date: endDateISO });
}

function countInmatesOnDate(db, iso8601DateStr) {
  return db
    .prepare(
      `
    SELECT COUNT(*)
    FROM inmate
    WHERE date(booking_date) = date(@iso8601DateStr)
  `
    )
    .get({ iso8601DateStr })["COUNT(*)"];
}

function getCompressedInmateDataForDate(db, iso8601DateStr, sortConfig = null) {
  const sortMethod =
    sortConfig &&
    INMATE_SORT_OPTIONS.has(sortConfig.option) &&
    SORT_DIRECTIONS.has(sortConfig.direction)
      ? sortConfig
      : null;

  console.log(`Getting compressed inmate data for date ${iso8601DateStr}`);
  let inData = null;
  if (!sortMethod || sortMethod.option === "bond") {
    inData = db
      .prepare(
        `
    SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
    FROM inmate
    WHERE date(booking_date) = date(@iso8601DateStr)
  `
      )
      .all({ iso8601DateStr });
  } else {
    inData = db
      .prepare(
        `
    SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
    FROM inmate
    WHERE date(booking_date) = date(@iso8601DateStr)
    ORDER BY ${INMATE_SORT_OPTIONS.get(sortConfig.option)} ${
          sortConfig.direction
        }
  `
      )
      .all({ iso8601DateStr });
  }

  const compressedInmates = [];
  for (const inmate of inData) {
    try {
      const charges = db
        .prepare(
          `
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = @inmate_id
      `
        )
        .all({ inmate_id: inmate.id });
      const chargeInformationArray = charges.map((charge) => {
        return new ChargeInformation(
          charge.description,
          charge.grade,
          charge.offenseDate
        );
      });

      const bond = db
        .prepare(
          `
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = @inmate_id
      `
        )
        .all({ inmate_id: inmate.id });
      let bondPennies = bond.reduce(
        (acc, curr) => acc + curr.amount_pennies,
        0
      );
      bondPennies = bond.some((bond) =>
        bond.type.toLowerCase().includes("unbondable")
      )
        ? Number.MAX_SAFE_INTEGER
        : bondPennies;

      const img = db
        .prepare(
          `
        SELECT img
        FROM img
        WHERE inmate_id = @inmate_id
      `
        )
        .get({ inmate_id: inmate.id });

      const compressedInmate = new CompressedInmate(
        inmate.id,
        inmate.first_name,
        inmate.middle_name,
        inmate.last_name,
        inmate.affix,
        inmate.booking_date, //TODO: parseIso here?
        bondPennies,
        inmate.dob,
        img.img,
        chargeInformationArray
      );
      compressedInmates.push(compressedInmate);
    } catch (err) {
      console.error(
        `Error getting compressed inmate data for inmate id ${inmate.id}. Error: ${err}`
      );
    }
  }

  if (sortMethod?.option === "bond") {
    compressedInmates.sort((a, b) => {
      if (sortConfig.direction === "asc") {
        return a.bondPennies - b.bondPennies;
      } else {
        return b.bondPennies - a.bondPennies;
      }
    });
  }
  return compressedInmates;
}

function getCompressedInmateDataForAlias(db, alias, sortConfig = null) {
  if (!alias) {
    return [];
  }

  const sortMethod =
    sortConfig &&
    INMATE_SORT_OPTIONS.has(sortConfig.option) &&
    SORT_DIRECTIONS.has(sortConfig.direction)
      ? sortConfig
      : null;
  console.log(`Getting compressed inmate data for alias ${alias}`);

  const aliasId = db
    .prepare(
      `
    SELECT id
    FROM alias
    where alias = @alias
  `
    )
    .get({ alias });

  if (!aliasId) {
    return [];
  }

  let inmateIds = db
    .prepare(
      `
    SELECT inmate_id
    FROM inmate_alias
    WHERE alias_id = @alias_id
  `
    )
    .all({ alias_id: aliasId.id });
  inmateIds = inmateIds.map((inmateId) => inmateId.inmate_id);

  let statement = null;
  if (!sortMethod || sortMethod.option === "bond") {
    statement = db.prepare(`
    SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
    FROM inmate
    WHERE id = @id
  `);
  } else {
    statement = db.prepare(`
    SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
    FROM inmate
    WHERE id = @id
    ORDER BY ${INMATE_SORT_OPTIONS.get(sortConfig.option)} ${
      sortConfig.direction
    }
  `);
  }

  const bulkInmates = db.transaction((inmateIds) => {
    return inmateIds.map((inmateId) => statement.get({ id: inmateId }));
  });

  const compressedInmates = [];
  for (const inmate of bulkInmates(inmateIds)) {
    try {
      const charges = db
        .prepare(
          `
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = @inmate_id
      `
        )
        .all({ inmate_id: inmate.id });
      const chargeInformationArray = charges.map((charge) => {
        return new ChargeInformation(
          charge.description,
          charge.grade,
          charge.offenseDate
        );
      });

      const bond = db
        .prepare(
          `
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = @inmate_id
      `
        )
        .all({ inmate_id: inmate.id });
      let bondPennies = bond.reduce(
        (acc, curr) => acc + curr.amount_pennies,
        0
      );
      bondPennies = bond.some((bond) =>
        bond.type.toLowerCase().includes("unbondable")
      )
        ? Infinity
        : bondPennies;

      const img = db
        .prepare(
          `
        SELECT img
        FROM img
        WHERE inmate_id = @inmate_id
      `
        )
        .get({ inmate_id: inmate.id });

      const compressedInmate = new CompressedInmate(
        inmate.id,
        inmate.first_name,
        inmate.middle_name,
        inmate.last_name,
        inmate.affix,
        inmate.booking_date,
        bondPennies,
        inmate.dob,
        img.img,
        chargeInformationArray
      );
      compressedInmates.push(compressedInmate);
    } catch (err) {
      console.error(
        `Error getting compressed inmate data for inmate id ${inmate.id}. Error: ${err}`
      );
    }
  }

  if (sortMethod?.option === "bond") {
    compressedInmates.sort((a, b) => {
      if (sortConfig.direction === "asc") {
        return a.bondPennies - b.bondPennies;
      } else {
        return b.bondPennies - a.bondPennies;
      }
    });
  }

  return compressedInmates;
}

function getCompressedInmateDataForSearchName(db, name, sortConfig = null) {
  if (!name || name.length < 3) {
    return [];
  }

  const sortMethod =
    sortConfig &&
    INMATE_SORT_OPTIONS.has(sortConfig.option) &&
    SORT_DIRECTIONS.has(sortConfig.direction)
      ? sortConfig
      : null;
  console.log(`Getting compressed inmate data for name ${name}`);

  let statement = null;
  if (!sortMethod) {
    statement = db.prepare(`
    SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
    FROM inmate
    WHERE LOWER((IFNULL(first_name, '') || ' ' || IFNULL(middle_name, '') || ' ' || IFNULL(last_name, '') || ' ' || IFNULL(affix, '')))
    LIKE LOWER('%' || @name || '%')
    LIMIT 20
  `);
  } else {
    statement = db.prepare(`
    SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
    FROM inmate
    WHERE LOWER((IFNULL(first_name, '') || ' ' || IFNULL(middle_name, '') || ' ' || IFNULL(last_name, '') || ' ' || IFNULL(affix, '')))
    LIKE LOWER('%' || @name || '%')
    ORDER BY ${INMATE_SORT_OPTIONS.get(sortConfig.option)} ${
      sortConfig.direction
    }
    LIMIT 20
  `);
  }

  const bulkInmates = statement.all({ name: name });
  const compressedInmates = [];
  for (const inmate of bulkInmates) {
    try {
      const charges = db
        .prepare(
          `
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = @inmate_id
      `
        )
        .all({ inmate_id: inmate.id });
      const chargeInformationArray = charges.map((charge) => {
        return new ChargeInformation(
          charge.description,
          charge.grade,
          charge.offenseDate
        );
      });

      const bond = db
        .prepare(
          `
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = @inmate_id
      `
        )
        .all({ inmate_id: inmate.id });
      let bondPennies = bond.reduce(
        (acc, curr) => acc + curr.amount_pennies,
        0
      );
      bondPennies = bond.some((bond) =>
        bond.type.toLowerCase().includes("unbondable")
      )
        ? Infinity
        : bondPennies;

      const img = db
        .prepare(
          `
        SELECT img
        FROM img
        WHERE inmate_id = @inmate_id
      `
        )
        .get({ inmate_id: inmate.id });

      const compressedInmate = new CompressedInmate(
        inmate.id,
        inmate.first_name,
        inmate.middle_name,
        inmate.last_name,
        inmate.affix,
        inmate.booking_date,
        bondPennies,
        inmate.dob,
        img.img,
        chargeInformationArray
      );
      compressedInmates.push(compressedInmate);
    } catch (err) {
      console.error(
        `Error getting compressed inmate data for inmate id ${inmate.id}. Error: ${err}`
      );
    }
  }
  return compressedInmates;
}

/**
 * Get inmate aggregate data for a given inmate id, or random if null id
 * @param {*} db database to query
 * @param {*} id target ID (or null for random)
 * @returns InmateAggregate
 */
function getInmateAggregateData(db, id = null) {
  try {
    const inmate = id
      ? db
          .prepare(
            `
      SELECT id,
      first_name,
      middle_name,
      last_name,
      affix,
      permanent_id,
      sex,
      dob,
      arresting_agency,
      booking_date,
      booking_number,
      height,
      weight,
      race,
      eye_color,
      img_url,
      scil_sysid
      FROM inmate
      WHERE id = @id
    `
          )
          .get({ id })
      : db
          .prepare(
            `
          SELECT id,
          first_name,
          middle_name,
          last_name,
          affix,
          permanent_id,
          sex,
          dob,
          arresting_agency,
          booking_date,
          booking_number,
          height,
          weight,
          race,
          eye_color,
          img_url,
          scil_sysid
          FROM inmate
          ORDER BY RANDOM()
          LIMIT 1
    `
          )
          .get();

    const inmateProfile = new InmateProfile(
      inmate.first_name,
      inmate.middle_name,
      inmate.last_name,
      inmate.affix,
      inmate.permanent_id,
      inmate.sex,
      inmate.dob,
      inmate.arresting_agency,
      inmate.booking_date,
      inmate.booking_number,
      inmate.height,
      inmate.weight,
      inmate.race,
      inmate.eye_color,
      [],
      [],
      inmate.scil_sysid
    );

    const charges = db
      .prepare(
        `
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = @inmate_id
      `
      )
      .all({ inmate_id: inmate.id });
    const chargeInformationArray = charges.map((charge) => {
      return new ChargeInformation(
        charge.description,
        charge.grade,
        charge.offense_date
      );
    });

    const aliasIds = db
      .prepare(
        `
        SELECT alias_id
        FROM inmate_alias
        WHERE inmate_id = @inmate_id
      `
      )
      .all({ inmate_id: inmate.id });
    const aliases = aliasIds.map((aliasId) => {
      const alias = db
        .prepare(
          `
          SELECT alias
          FROM alias
          WHERE id = @alias_id
        `
        )
        .get({ alias_id: aliasId.alias_id });
      return alias ? alias.alias : null;
    });
    inmateProfile.aliases = aliases ? aliases : [];

    const bond = db
      .prepare(
        `
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = @inmate_id
      `
      )
      .all({ inmate_id: inmate.id });
    const bondInformationArray = bond.map(
      (bond) => new BondInformation(bond.type, bond.amount_pennies)
    );

    // TODO! Replace with s3
    const img = db
      .prepare(
        `
        SELECT img
        FROM img
        WHERE inmate_id = @inmate_id
      `
      )
      .get({ inmate_id: inmate.id });
    inmateProfile.imgBlob = img.img;

    return {
      inmateAggregate: new InmateAggregate(
        inmateProfile,
        bondInformationArray,
        chargeInformationArray
      ),
      inmateId: inmate.id,
    };
  } catch (err) {
    console.error(
      `Error getting inmate data for inmate id ${id}. Error: ${err}`
    );
    throw err;
  }
}

function getRelatedNames(db, name) {
  if (!name || name.length < 3) {
    return [];
  }

  try {
    let inmates = db
      .prepare(
        `
    SELECT first_name, middle_name, last_name, affix
    FROM inmate
    WHERE LOWER((IFNULL(first_name, '') || ' ' || IFNULL(middle_name, '') || ' ' || IFNULL(last_name, '') || ' ' || IFNULL(affix, '')))
    LIKE LOWER('%' || @name || '%')
    LIMIT 20
  `
      )
      .all({ name });

    inmates = inmates.map((inmate) =>
      `${inmate.first_name} ${inmate.middle_name} ${inmate.last_name} ${inmate.affix}`.trim()
    );

    return inmates;
  } catch (err) {
    console.error(
      `Error getting related names for name ${name}. Error: ${err}`
    );
    return [];
  }
}

function getRelatedAliases(db, alias) {
  if (!alias || alias.length < 3) {
    return [];
  }

  console.log("Getting related aliases for alias", alias);

  try {
    let aliases = db
      .prepare(
        `
      SELECT alias
      FROM alias
      WHERE LOWER(alias) LIKE LOWER('%' || @alias || '%')
      LIMIT 20
    `
      )
      .all({ alias });
    console.log(alias);
    return aliases.map((alias) => alias.alias.trim());
  } catch (err) {
    console.error(
      `Error getting related aliases for name ${alias}. Error: ${err}`
    );
    return [];
  }
}

module.exports = {
  setupDbCloseConditions,
  createTables,
  serializeInmateAggregate,
  getInmateIdsWithNullImages,
  countInmatesOnDate,
  getCompressedInmateDataForDate,
  getCompressedInmateDataForAlias,
  getCompressedInmateDataForSearchName,
  getInmateAggregateData,
  getRelatedNames,
  getRelatedAliases,
  getClient,
  end,
};
