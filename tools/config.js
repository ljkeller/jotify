const config = {
  todayInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today",
  // Requires appending date in format MM/DD/YY
  datelessInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=",
  // Requires appending inmate id (sysid=XX...)
  baseInmateLink: "https://www.scottcountyiowa.us/sheriff/inmates.php?",

  sleepBetweenRequests: 1000, // ms
  databaseFile: ":memory:",
  lastNDays: 1,
};

// TODO: defaults?
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
      amount_pennies INTEGER NOT NULL,
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
  `
};

module.exports = { config, scJailIoTableCreate };
