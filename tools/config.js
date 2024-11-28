// const { postgresDevConfig } = require("./secrets");

const config = {
  todayInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today",
  // Requires appending date in format MM/DD/YY
  datelessInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=",
  // Requires appending inmate id (sysid=XX...)
  baseInmateLink: "https://www.scottcountyiowa.us/sheriff/inmates.php?",

  sleepBetweenRequests: 1000, // ms
  databaseFile: "scjailio-1-20-24.db",
  prototypeFile: "scjailio-prototype.db",
  printDbQueries: false,
  lastNDays: 2,

  database: "postgres",
  appReadFile: "scjailio-1-20-24.db",
  isDev: false,
};

const DBConfig = {
  sqliteWritable: {
    type: "sqlite",
    file: "scjailio-1-20-24.db",
    config: {
      verbose: config.printDbQueries ? console.log : null,
    },
  },
  sqliteReadOnly: {
    type: "sqlite",
    file: "scjailio-1-20-24.db",
    config: {
      verbose: config.printDbQueries ? console.log : null,
      readonly: true,
    },
  },
  sqliteMemory: {
    // Prefered testing config
    type: "sqlite",
    file: ":memory:",
    config: {
      verbose: config.printDbQueries ? console.log : null,
    },
  },
  postgresDev: {
    type: "postgres",
    config: null,
  },
  postgresProd: {
    type: "postgres",
    config: null
  }
};

// When using postgres, the config config / db url is set in the environment
const runtimeDbConfig = process.env.DB === "sqlite" ? DBConfig.sqliteReadOnly
                      : process.env.DB === "memory" ? DBConfig.sqliteMemory
                      : process.env.DB === "postgresdev" ? DBConfig.postgresDev
                      : DBConfig.postgresProd;


const postgresSchemas = {
  inmate: `
    CREATE TABLE IF NOT EXISTS inmate (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL CHECK (first_name <> ''),
      middle_name TEXT,
      last_name TEXT NOT NULL CHECK (last_name <> ''),
      affix TEXT,
      permanent_id TEXT,
      sex TEXT,
      dob date NOT NULL,
      arresting_agency TEXT,
      booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
      booking_number TEXT,
      height TEXT,
      weight TEXT,
      race TEXT,
      eye_color TEXT,
      img_url TEXT,
      scil_sysid TEXT,
      record_visits INTEGER DEFAULT 0,
      shared INTEGER DEFAULT 0,
      UNIQUE (first_name, last_name, dob, booking_date)
    )
  `,
  alias: `
    CREATE TABLE IF NOT EXISTS alias (
      id SERIAL PRIMARY KEY,
      alias TEXT UNIQUE NOT NULL CHECK (alias <> '')
    )
  `,
  inmateAliasJunction: `
    CREATE TABLE IF NOT EXISTS inmate_alias (
      inmate_id INTEGER NOT NULL,
      alias_id INTEGER NOT NULL,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id),
      FOREIGN KEY (alias_id) REFERENCES alias(id),
      PRIMARY KEY (inmate_id, alias_id)
    )
  `,
  img: `
    CREATE TABLE IF NOT EXISTS img (
      id SERIAL PRIMARY KEY,
      inmate_id INTEGER NOT NULL,
      img BYTEA,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id) 
    )
  `,
  bondInformation: `
    CREATE TABLE IF NOT EXISTS bond (
      id SERIAL PRIMARY KEY,
      inmate_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount_pennies INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id) 
    )
  `,
  chargeInformation: `
    CREATE TABLE IF NOT EXISTS charge (
      id SERIAL PRIMARY KEY,
      inmate_id INTEGER,
      description TEXT,
      grade TEXT,
      offense_date TEXT,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id)
    )
  `,
};

const scJailIoTableCreate = {
  inmate: `
    CREATE TABLE IF NOT EXISTS inmate (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL CHECK (first_name <> ''),
      middle_name TEXT,
      last_name TEXT NOT NULL CHECK (last_name <> ''),
      affix TEXT,
      permanent_id TEXT,
      sex TEXT,
      dob TEXT NOT NULL CHECK (dob <> ''),
      arresting_agency TEXT,
      booking_date TEXT NOT NULL CHECK (booking_date <> ''),
      booking_number TEXT,
      height TEXT,
      weight TEXT,
      race TEXT,
      eye_color TEXT,
      img_url TEXT,
      scil_sysid TEXT,
      record_visits INTEGER DEFAULT 0,
      UNIQUE (first_name, last_name, dob, booking_date)
    )
  `,
  alias: `
    CREATE TABLE IF NOT EXISTS alias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alias TEXT UNIQUE NOT NULL CHECK (alias <> '')
    )
  `,
  inmateAliasJunction: `
    CREATE TABLE IF NOT EXISTS inmate_alias (
      inmate_id INTEGER NOT NULL,
      alias_id INTEGER NOT NULL,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id),
      FOREIGN KEY (alias_id) REFERENCES alias(id),
      PRIMARY KEY (inmate_id, alias_id)
    )
  `,
  img: `
    CREATE TABLE IF NOT EXISTS img (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inmate_id INTEGER NOT NULL,
      img BLOB,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id)
    )
  `,
  bondInformation: `
    CREATE TABLE IF NOT EXISTS bond (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inmate_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount_pennies INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id)
    )
  `,
  chargeInformation: `
    CREATE TABLE IF NOT EXISTS charge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inmate_id INTEGER,
      description TEXT,
      grade TEXT,
      offense_date TEXT,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id)
    )
  `,
};

// This controls the number of records that are queried at a time
// for / and api
const RECORD_QUERY_LIMIT = 15;

module.exports = {
  config,
  scJailIoTableCreate,
  postgresSchemas,
  DBConfig,
  runtimeDbConfig,
  RECORD_QUERY_LIMIT
};
