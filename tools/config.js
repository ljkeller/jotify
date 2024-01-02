const config = {
  todayInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today",
  // Requires appending date in format MM/DD/YY
  datelessInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=",
  // Requires appending inmate id (sysid=XX...)
  baseInmateLink: "https://www.scottcountyiowa.us/sheriff/inmates.php?",

  sleepBetweenRequests: 125, // ms
  databaseFile: "last_day_inmates_with_imgs.db",
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

module.exports = { config, tableCreate, tables };
