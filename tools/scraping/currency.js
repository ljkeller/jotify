// Shoutout to https://timleland.com/money-in-javascript/
// I'm not a JS expert, so outsourcing this to someone else for now.
// Besides, it's not this is mission critical functionality for my uses.
var dollarsToCents = function (value) {
  // remove any non-numeric characters besides decimal point, minus sign
  value = (value + '').replace(/[^\d.-]/g, '');
  if (value && value.includes('.')) {
    // Drop extra decimal places
    value = value.substring(0, value.indexOf('.') + 3);
  }

  return value ? Math.round(parseFloat(value) * 100) : 0;
}

module.exports = { dollarsToCents };