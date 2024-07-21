const postgres = require("postgres");
const AWS = require("aws-sdk");

const { postgresSchemas } = require("../config");
const { config, DBConfig } = require("../config");
const { INMATE_SORT_OPTIONS, SORT_DIRECTIONS } = require("./sqliteUtils");

const CompressedInmate = require("../models/compressedInmate");
const ChargeInformation = require("../models/chargeInformation");
const BondInformation = require("../models/bondInformation");
const InmateProfile = require("../models/inmateProfile");
const InmateAggregate = require("../models/inmateAggregate");

// timeout & lifetime are in seconds
const psql = postgres(
  config.isDev
    ? `postgres://${DBConfig.postgresDev.config.username}:${DBConfig.postgresDev.config.password}@${DBConfig.postgresDev.config.ip}:${DBConfig.postgresDev.config.port}`
    : process.env.DATABASE_URL
  , {
    idle_timeout: 20,
    max_lifetime: 60 * 10,
  }
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
    await db.end({ timeout: 5 });
    console.log("Teardown complete");
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
  `;
  return aliasObj.id;
}

async function serializeInmateAggregate(db, inmate) {
  try {
    await db.begin(async (db) => {
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
      `;
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
      `;

      // TODO: optimize looping insert
      for (const bond of inmate.bondInformation) {
        await db`
          INSERT INTO bond
            (inmate_id, type, amount_pennies)
          VALUES
            (${inmateId}, ${bond.type}, ${bond.amountPennies})
        `;
      }

      // TODO: optimize looping insert
      for (const charge of inmate.chargeInformation) {
        await db`
        INSERT INTO charge
          (inmate_id, description, grade, offense_date)
        VALUES
          (${inmateId}, ${charge.description}, ${charge.grade}, ${charge.offenseDate})
        `;
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

async function countInmatesOnDate(db, iso8601DateStr) {
  try {
    const [{ count }] = await db`
      SELECT COUNT(*) FROM inmate
      WHERE DATE(booking_date) = date(${iso8601DateStr});
    `;
    return parseInt(count, 10);
  } catch (error) {
    console.error(`Error counting inmates on date ${iso8601DateStr}: ${error}`);
    return 0;
  }
}

async function getCompressedInmateDataForDate(
  db,
  iso8601DateStr,
  sortConfig = null
) {
  try {
    const sortMethod =
      sortConfig &&
        INMATE_SORT_OPTIONS.has(sortConfig.option) &&
        SORT_DIRECTIONS.has(sortConfig.direction)
        ? sortConfig
        : null;

    let s3 = new AWS.S3({ apiVersion: '2006-03-01' });

    console.log(`Getting compressed inmate data for date ${iso8601DateStr}`);
    let inData = null;
    if (!sortMethod || sortMethod.option === "bond") {
      inData = await db`
        SELECT id, first_name, middle_name, last_name, affix, dob, booking_date, img_url
        FROM inmate
        WHERE date(booking_date) = date(${iso8601DateStr})
      `;
    } else {
      const order_by_clause = INMATE_SORT_OPTIONS.get(sortMethod.option) + " " + sortMethod.direction;
      // Postgres driver really strugging to interpolate the dynamic order by clause
      // WARN: be VERY careful to modify this unsafe query.
      inData = await db.unsafe(`
        SELECT id, first_name, middle_name, last_name, affix, dob, booking_date, img_url
        FROM inmate
        WHERE date(booking_date) = date('${iso8601DateStr}')
        ORDER BY ${INMATE_SORT_OPTIONS.get(sortMethod.option)} ${sortMethod.direction}
      `);
    }

    const compressedInmates = (await Promise.all(inData.map(inmate => fetchInmateDetailsInParallel(db, s3, inmate)))).filter(inmate => inmate !== null);

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
  } catch (error) {
    console.error(
      `Error querying for compressed inmate data for date ${iso8601DateStr}: ${error} `
    );
    return [];
  }
}

async function fetchInmateDetailsInParallel(db, s3, inmate) {
  try {
    const chargesPromise = db`
          SELECT description, grade, offense_date
          FROM charge
          WHERE inmate_id = ${inmate.id}
        `;

    const bondPromise = db`
          SELECT type, amount_pennies
          FROM bond
          WHERE inmate_id = ${inmate.id}
        `;

    const imgPromise = inmate.img_url ? s3.getObject({
      Bucket: process.env.AWS_BUCKET_NAME || 'scjailio-dev',
      Key: inmate.img_url,
    }).promise().then(response => response.Body).catch(err => {
      console.error(`Error getting s3 image for inmate id ${inmate.id}.Error: ${err} `);
      return null;
    }) : Promise.resolve(null);

    const [charges, bond, img] = await Promise.all([chargesPromise, bondPromise, imgPromise]);

    const chargeInformationArray = charges.map((charge) => {
      return new ChargeInformation(
        charge.description,
        charge.grade,
        charge.offenseDate
      );
    });

    let bondPennies = bond.reduce(
      (acc, curr) => acc + curr.amount_pennies,
      0
    );
    bondPennies = bond.some((bond) =>
      bond.type.toLowerCase().includes("unbondable")
    )
      ? Number.MAX_SAFE_INTEGER
      : bondPennies;

    return new CompressedInmate(
      inmate.id,
      inmate.first_name,
      inmate.middle_name,
      inmate.last_name,
      inmate.affix,
      inmate.booking_date.toString(), // PostgreSQL automatically converts timestampz to Date(). This will be uniform with SQLite
      bondPennies,
      inmate.dob,
      img,
      chargeInformationArray
    );
  } catch (err) {
    console.error(
      `Error getting compressed inmate data for inmate id ${inmate.id}.Error: ${err} `
    );
    return null;
  }
}

async function getCompressedInmateDataForSearchName(
  db,
  name,
  sortConfig = null
) {
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

  let bulkInmates = null;
  if (!sortMethod) {
    bulkInmates = await db`
      SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
      FROM inmate
      WHERE LOWER(
          TRIM(BOTH FROM(
            COALESCE(first_name, '') || ' ' ||
            COALESCE(middle_name, '') || ' ' ||
            COALESCE(last_name, '') || ' ' ||
            COALESCE(affix, '')
          ))
        ) LIKE LOWER('%' || ${name} || '%')
      LIMIT 20;
      `;
  } else {
    bulkInmates = await db`
      SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
      FROM inmate
      WHERE LOWER((COALESCE(first_name, '') || ' ' || COALESCE(middle_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(affix, '')))
      LIKE LOWER('%' || ${name} || '%')
      ORDER BY ${INMATE_SORT_OPTIONS.get(sortMethod.option) + " " + sortMethod.direction}
      LIMIT 20
        `;
  }

  const compressedInmates = [];
  for (const inmate of bulkInmates) {
    try {
      const charges = await db`
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = ${inmate.id}
      `;
      const chargeInformationArray = charges.map((charge) => {
        return new ChargeInformation(
          charge.description,
          charge.grade,
          charge.offenseDate
        );
      });

      const bond = await db`
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = ${inmate.id}
      `;
      let bondPennies = bond.reduce(
        (acc, curr) => acc + curr.amount_pennies,
        0
      );
      bondPennies = bond.some((bond) =>
        bond.type.toLowerCase().includes("unbondable")
      )
        ? Infinity
        : bondPennies;

      const [{ img }] = await db`
        SELECT img
        FROM img
        WHERE inmate_id = ${inmate.id}
      `;
      const compressedInmate = new CompressedInmate(
        inmate.id,
        inmate.first_name,
        inmate.middle_name,
        inmate.last_name,
        inmate.affix,
        inmate.booking_date,
        bondPennies,
        inmate.dob,
        img,
        chargeInformationArray
      );
      compressedInmates.push(compressedInmate);
    } catch (err) {
      console.error(
        `Error getting compressed inmate data for inmate id ${inmate.id}.Error: ${err} `
      );
    }
  }
  return compressedInmates;
}

async function getCompressedInmateDataForAlias(db, alias, sortConfig = null) {
  if (!alias) {
    return [];
  }

  const sortMethod =
    sortConfig &&
      INMATE_SORT_OPTIONS.has(sortConfig.option) &&
      SORT_DIRECTIONS.has(sortConfig.direction)
      ? sortConfig
      : null;
  console.log(
    `Getting compressed inmate data for alias ${alias}.Sort method: ${JSON.stringify(
      sortMethod
    )
    } `
  );

  const [{ id: aliasId }] = await db`
    SELECT id
    FROM alias
    where alias = ${alias}
      `;

  if (!aliasId) {
    return [];
  }

  let inmateIds = await db`
    SELECT inmate_id
    FROM inmate_alias
    WHERE alias_id = ${aliasId}
      `;
  // inmateIds = inmateIds.map((inmateId) => inmateId.inmate_id);

  async function getInmateData(id, sortMethod) {
    let inmateData = null;
    if (!sortMethod || sortMethod.option === "bond") {
      [inmateData] = await db`
        SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
        FROM inmate
        WHERE id = ${id}
      `;
    } else {
      [inmateData] = await db`
        SELECT id, first_name, middle_name, last_name, affix, dob, booking_date
        FROM inmate
        WHERE id = ${id}
        ORDER BY ${INMATE_SORT_OPTIONS.get(sortMethod.option) + sortMethod.direction
        }
      `;
    }
    return inmateData;
  }

  let bulkInmates = inmateIds.map(async (inmateId) =>
    getInmateData(inmateId.inmate_id, sortMethod)
  );
  bulkInmates = await Promise.all(bulkInmates);

  const compressedInmates = [];
  for (const inmate of bulkInmates) {
    try {
      const charges = await db`
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = ${inmate.id}
      `;
      const chargeInformationArray = charges.map((charge) => {
        return new ChargeInformation(
          charge.description,
          charge.grade,
          charge.offenseDate
        );
      });

      const bond = await db`
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = ${inmate.id}
      `;
      let bondPennies = bond.reduce(
        (acc, curr) => acc + curr.amount_pennies,
        0
      );
      bondPennies = bond.some((bond) =>
        bond.type.toLowerCase().includes("unbondable")
      )
        ? Infinity
        : bondPennies;

      const [img] = await db`
        SELECT img
        FROM img
        WHERE inmate_id = ${inmate.id}
      `;

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
        `Error getting compressed inmate data for inmate id ${inmate.id}.Error: ${err} `
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

/**
 * Get inmate aggregate data for a given inmate id, or random if null id
 * @param {*} db database to query
 * @param {*} id target ID (or null for random)
 * @returns InmateAggregate, inmate ID
 */
async function getInmateAggregateData(db, id = null) {
  try {
    const [inmate] = id
      ? await db`
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
          WHERE id = ${id}
      `
      : await db`
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
        `;
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

    const charges = await db`
        SELECT description, grade, offense_date
        FROM charge
        WHERE inmate_id = ${inmate.id}
      `;
    const chargeInformationArray = charges.map((charge) => {
      return new ChargeInformation(
        charge.description,
        charge.grade,
        charge.offense_date
      );
    });

    const aliasIds = await db`
        SELECT alias_id
        FROM inmate_alias
        WHERE inmate_id = ${inmate.id}
      `;
    const aliases = await Promise.all(
      aliasIds.map(async (aliasId) => {
        const [alias] = await db`
          SELECT alias
          FROM alias
          WHERE id = ${aliasId.alias_id}
      `;
        return alias ? alias.alias : null;
      })
    );
    inmateProfile.aliases = aliases ? aliases : [];

    const bond = await db`
        SELECT type, amount_pennies
        FROM bond
        WHERE inmate_id = ${inmate.id}
      `;
    const bondInformationArray = bond.map(
      (bond) => new BondInformation(bond.type, bond.amount_pennies)
    );

    //TODO: Replace with s3
    const [img] = await db`
        SELECT img
        FROM img
        WHERE inmate_id = ${inmate.id}
      `;
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
      `Error getting inmate data for inmate id ${id}.Error: ${err} `
    );
    throw err;
  }
}


async function getRecommendedRelatedInmates(db, id) {
  let recommended = [];
  try {
    recommended = await db`
      SELECT inmate.id, first_name, middle_name, last_name, affix, img
      FROM inmate
      LEFT JOIN img ON inmate.id = img.inmate_id
      WHERE inmate.id != ${id}
      ORDER BY embedding <-> (SELECT embedding FROM inmate WHERE id = ${id})
      LIMIT 10
    `;

    recommended = recommended.map((inmate) => {
      const fullname = (inmate.first_name +
        (inmate.middle_name ? ` ${inmate.middle_name} ` : " ") +
        inmate.last_name +
        (inmate.affix ? ` ${inmate.affix} ` : "")
      );

      return {
        id: inmate.id,
        full_name: fullname,
        img_data: inmate.img
      };
    });

  } catch (err) {
    console.error(`Error getting recommended related inmates for inmate id ${id}.Error: ${err} `);
  }
  return recommended;
}

module.exports = {
  getClient,
  setupDbCloseConditions,
  createTables,
  serializeInmateAggregate,
  psql,
  end,
  countInmatesOnDate,
  getCompressedInmateDataForDate,
  getCompressedInmateDataForSearchName,
  getCompressedInmateDataForAlias,
  getInmateAggregateData,
  getRecommendedRelatedInmates
};
