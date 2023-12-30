const config = {
  todayInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today",
  // Requires appending date in format MM/DD/YY
  datelessInmatesUrl:
    "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=",
  // Requires appending inmate id (sysid=XX...)
  baseInmateLink: "https://www.scottcountyiowa.us/sheriff/inmates.php?",

  sleepBetweenRequests: 75, // ms
  databaseFile: ":memory:",
  lastNDays: 1,
};

module.exports = config;
