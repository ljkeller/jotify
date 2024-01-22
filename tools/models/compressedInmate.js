function getMaxChargeGrade(charges) {
  return charges.some((charge) => charge.grade === 'felony') ? "felony" : "misdemeanor";
}

class CompressedInmate {
  constructor(first, middle, last, affix, bookingDate, bondPennies, dob, img, chargeInformationArray) {
    this.fullName = (first + ' ' + middle + ' ' + last + ' ' + affix).trim();
    this.bookingDate = bookingDate;
    this.bondPennies = bondPennies;
    this.dob = dob;
    this.img = img;
    this.chargeGrade = getMaxChargeGrade(chargeInformationArray);
    this.chargeInformationArray = chargeInformationArray;
  }
}

module.exports = CompressedInmate;