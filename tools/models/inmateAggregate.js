class InmateAggregate {
  constructor(
    inmateProfile,
    bondInformation,
    chargeInformation
  ) {
    this.inmateProfile = inmateProfile;
    this.bondInformation = bondInformation;
    this.chargeInformation = chargeInformation;
  }
}

module.exports = InmateAggregate;