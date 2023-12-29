class Inmate {
    constructor(firstName, middleName, lastName, age, bookingDate, releaseDate, arrestingAgency, charges, imgUrl, inmateUrl) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.age = age;
        this.bookingDate = bookingDate;
        this.releaseDate = releaseDate;
        this.arrestingAgency = arrestingAgency;
        this.charges = charges;
        this.imgUrl = imgUrl;
        this.inmateUrl = inmateUrl;
    }
}

module.exports = Inmate;