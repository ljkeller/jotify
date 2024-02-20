class InmateProfile {
  constructor(
    first,
    middle,
    last,
    affix,
    permanentId,
    sex,
    dob,
    arrestingAgency,
    bookingDateIso8601,
    bookingNumber,
    height,
    weight,
    race,
    eyeColor,
    aliases,
    imgBlob,
    scilSysId
  ) {
    this.first = first;
    this.middle = middle;
    this.last = last;
    this.affix = affix;
    this.permanentId = permanentId;
    this.sex = sex;
    this.dob = dob;
    this.arrestingAgency = arrestingAgency;
    this.bookingDateIso8601 = bookingDateIso8601;
    this.bookingNumber = bookingNumber;
    this.height = height;
    this.weight = weight;
    this.race = race;
    this.eyeColor = eyeColor;
    this.aliases = aliases;
    this.imgBlob = imgBlob;
    this.scilSysId = scilSysId;
  }

  getFullName() {
    return this.first + (this.middle ? ` ${this.middle} ` : ' ') + this.last + (this.affix ? ` ${this.affix}` : '');
  }

  getCoreAttributes() {
    return {
      firstName: this.first,
      lastName: this.last,
      dob: this.dob,
      bookingDate: this.bookingDateIso8601,
    }
  }
}

module.exports = InmateProfile;