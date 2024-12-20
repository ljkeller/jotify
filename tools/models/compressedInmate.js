function getMaxChargeGrade(charges) {
  return charges.some((charge) => charge.grade === "felony")
    ? "felony"
    : "misdemeanor";
}

class CompressedInmate {
  constructor(
    id,
    first,
    middle,
    last,
    affix,
    bookingDate,
    bondPennies,
    dob,
    img = null,
    chargeInformationArray,
    img_url = null
  ) {
    this.id = id;
    this.fullName = [first, middle, last, affix].join(" ").trim();
    this.bookingDate = bookingDate;
    this.bondPennies = bondPennies;
    if (dob instanceof Date) {
      this.dob = dob.toISOString().split("T")[0];
    } else {
      this.dob = dob;
    }
    this.img = img;
    this.img_url = img_url;
    this.chargeGrade = getMaxChargeGrade(chargeInformationArray);
    this.chargeInformationArray = chargeInformationArray;
  }
}

module.exports = CompressedInmate;
