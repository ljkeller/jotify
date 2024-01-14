const { parse, formatISO } = require("date-fns");

// TODO! replace this function with date-fns fn
// Scott County only officially supports last 7 days of data
function getLastNDaysLocal(n) {
  const dates = [];
  for (let i = 0; i < n; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Format the date as 'MM/DD/YY'
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // January is 0
    const year = String(date.getFullYear()).slice(-2); // Get last two digits

    const formattedDate = `${month}/${day}/${year}`;
    dates.push(formattedDate);
  }
  console.log("Last n days: ", dates);

  return dates;
}

// TODO: Unit test
function scilDateTimeToIso8601(dateTimeStr) {
  // Examples of input date strings:
  // 12/27/2023 12:05 PM
  // 1/1/2024 2:20 PM (January)
  // 1/1/2024 10:39 AM (January)

  // https://date-fns.org/v3.0.6/docs/parse
  try {
    formatStr = "M/d/yyyy h:mm aa";
    // console.log("Parsing date string: ", dateTimeStr);
    const parsedDate = parse(dateTimeStr, formatStr, new Date());
    return formatISO(parsedDate);
  } catch (err) {
    console.error(`Encountered error parsing date time string: ${dateTimeStr}. Error: ${err}`);
    return formatISO(new Date());
  }
}

// Attempts to generate an ISO 8601 date from an ambiguous date string
// Falls back to current date if parsing fails
// 
// Useful for scil date parsing because various date formats are used
// TODO: Unit test
function ambiguousDateToIso8601Date(dateStr) {
  // Examples of input date strings:
  // 02/01/2023 (February 1)
  // 2/1/2023 (February 1)

  // https://date-fns.org/v3.0.6/docs/parse
  try {
    let parsedDate = "";
    try {
      parsedDate = unsafeScilBondDateTo8601DateFormat(dateStr);
      return formatISO(parsedDate, { representation: "date" });
    } catch { }
    try {
      parsedDate = unsafeScilProfileDatetoIso8601DateFormat(dateStr);
      return formatISO(parsedDate, { representation: "date" });
    } catch { }

    throw new Error(`Encountered error parsing ambiguous string: ${dateStr}`);
  } catch (err) {
    console.error(err);
    return formatISO(new Date(), { representation: "date" });
  }
}

// TODO: Unit test
function unsafeScilBondDateTo8601DateFormat(dateStr) {
  // Example of input date strings:
  // 2024-01-09 (Jan 9 2024)

  // https://date-fns.org/v3.0.6/docs/parse
  const formatStr = "yyyy-MM-dd";
  const parsedDate = parse(dateStr, formatStr, new Date());
  return formatISO(parsedDate, { representatio: "date" });
}

// TODO: Unit test
function unsafeScilProfileDatetoIso8601DateFormat(dateStr) {
  // Examples of input date strings:
  // 12/27/2023
  // 1/1/2024 (January)

  // https://date-fns.org/v3.0.6/docs/parse
  const formatStr = "M/d/yyyy";
  const parsedDate = parse(dateStr, formatStr, new Date());
  return formatISO(parsedDate, { representatio: "date" });
}

module.exports = { getLastNDaysLocal, scilDateTimeToIso8601, ambiguousDateToIso8601Date };
