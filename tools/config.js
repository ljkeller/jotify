const config = {
  todayInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today",
  // Requires appending date in format MM/DD/YY
  datelessInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=",
  // Requires appending inmate id (sysid=XX...)
  baseInmateLink: "https://www.scottcountyiowa.us/sheriff/inmates.php?",

  sleepBetweenRequests: 125, // ms
  databaseFile: ":memory:",
  lastNDays: 1,
};

const tables = {
  inmates: "inmates",
  aliases: "aliases",
  inmateAliasJunction: "inmate_alias",
};

const tableCreate = {
  inmates: `
    CREATE TABLE IF NOT EXISTS ${tables.inmates} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL CHECK (first_name <> ''),
      middle_name TEXT,
      last_name TEXT NOT NULL CHECK (last_name <> ''),
      age INTEGER,
      booking_date TEXT NOT NULL CHECK (booking_date <> ''),
      arresting_agency TEXT,
      charges TEXT,
      img BLOB,
      url TEXT
    )
  `,
  aliases: `
    CREATE TABLE IF NOT EXISTS ${tables.aliases} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alias TEXT UNIQUE NOT NULL CHECK (alias <> '')
    )
  `,
  inmateAliasJunction: `
    CREATE TABLE IF NOT EXISTS ${tables.inmateAliasJunction} (
      inmate_id INTEGER NOT NULL,
      alias_id INTEGER NOT NULL,
      FOREIGN KEY (inmate_id) REFERENCES inmates(id),
      FOREIGN KEY (alias_id) REFERENCES aliases(id),
      PRIMARY KEY (inmate_id, alias_id)
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
      height TEXT,
      weight TEXT,
      race TEXT,
      eye_color TEXT,
      img_url TEXT
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
      FOREIGN KEY (alias_id) REFERENCES aliases(id),
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
      type TEXT NOT NULL CHECK (type <> ''),
      amount_pennies INTEGER NOT NULL,
      FOREIGN KEY (inmate_id) REFERENCES inmate(id)
    )
  `,
  chargeInformation: `
    CREATE TABLE IF NOT EXISTS charge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inmate_id INTEGER NOT NULL,
      description TEXT NOT NULL CHECK (description <> ''),
      grade TEXT NOT NULL CHECK (grade <> ''),
      offense_date TEXT NOT NULL CHECK (offense_date <> ''),
      FOREIGN KEY (inmate_id) REFERENCES inmate(id)
    )
  `
};

module.exports = { config, tableCreate, tables, scJailIoTableCreate };
