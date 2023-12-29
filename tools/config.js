const config = {
    todayInmatesUrl: "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today",
    // Requires appending date in format MM/DD/YY
    datelessInmatesUrl: "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=",
    // Requires appending inmate id (sysid=XX...)
    baseInmateLink: "https://www.scottcountyiowa.us/sheriff/inmates.php?",

    sleepBetweenRequests: 50, // ms

    databaseFile: ":memory:",
}

module.exports = config;