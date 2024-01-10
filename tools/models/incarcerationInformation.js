class IncarcerationInformation {
    constructor(
        arrestingAgency,
        bookingDateTime,
        bookingNumber,
    ) {
        this.arrestingAgency = arrestingAgency;
        this.bookingDateTime = bookingDateTime;
        this.bookingNumber = bookingNumber;
    }
}

module.exports = IncarcerationInformation;