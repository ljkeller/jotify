function getMaxChargeGrade(charges) {
  charges.includes('felony') ? 'felony' : 'misdemeanor';
}

class CompressedInmate {
  constructor(first, middle, last, affix, bookingDate, bondPennies, dob, img, charges) {
    this.fullName = first + ' ' + middle + ' ' + last + ' ' + affix;
    this.bookingDate = bookingDate;
    this.bondPennies = bondPennies;
    this.dob = dob;
    this.img = img;
    this.chargeGrade = getMaxChargeGrade(charges);
    this.charges = charges;
  }
}

module.exports = CompressedInmate;