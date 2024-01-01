class Inmate {
  constructor(
    firstName,
    middleName,
    lastName,
    age,
    bookingDate,
    arrestingAgency,
    charges,
    imgUrl,
    inmateUrl,
    aliases
  ) {
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.age = age;
    this.bookingDate = bookingDate;
    this.arrestingAgency = arrestingAgency;
    this.charges = charges;
    this.imgUrl = imgUrl;
    this.url = inmateUrl;
    this.aliases = aliases;
  }
}

module.exports = Inmate;
