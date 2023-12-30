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

module.exports = { getLastNDaysLocal };
