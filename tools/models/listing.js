class InmateAggregate {
  constructor(
    inmateProfile,
    incarcerationInformation,
    bondInformation,
    chargeInformation
  ) {
    this.inmateProfile = inmateProfile;
    this.incarcerationInformation = incarcerationInformation;
    this.bondInformation = bondInformation;
    this.chargeInformation = chargeInformation;
  }
}

module.exports = InmateAggregate;