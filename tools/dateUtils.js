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

function scilDateTimeToIso8601(dateTimeStr) {
  // Examples of date strings:
  // 12/27/2023 12:05 PM
  // 1/1/2024 2:20 PM (January)
  // 1/1/2024 10:39 AM (January)

  // https://date-fns.org/v3.0.6/docs/parse
  try {
    formatStr = "M/d/yyyy h:mm aa";
    console.log("Parsing date string: ", dateTimeStr);
    const parsedDate = parse(dateTimeStr, formatStr, new Date());
    return formatISO(parsedDate);
  } catch (err) {
    console.error(err);
    return formatISO(new Date());
  }
}

module.exports = { getLastNDaysLocal, scilDateTimeToIso8601 };
