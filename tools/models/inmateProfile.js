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
    // Most instance variables should be strings or numbers (except imgBlob)
    this.first = first;
    this.middle = middle;
    this.last = last;
    this.affix = affix;
    this.permanentId = permanentId;
    this.sex = sex;

    if (dob instanceof Date) {
      this.dob = dob.toISOString().split("T")[0];
    } else {
      this.dob = dob;
    }
    this.arrestingAgency = arrestingAgency;

    if (bookingDateIso8601 instanceof Date) {
      this.bookingDateIso8601 = bookingDateIso8601.toISOString();
    } else {
      this.bookingDateIso8601 = bookingDateIso8601;
    }
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
    return (
      this.first +
      (this.middle ? ` ${this.middle} ` : " ") +
      this.last +
      (this.affix ? ` ${this.affix}` : "")
    );
  }

  getCoreAttributes() {
    return {
      firstName: this.first,
      lastName: this.last,
      dob: this.dob,
      bookingDate: this.bookingDateIso8601,
    };
  }
}

module.exports = InmateProfile;
