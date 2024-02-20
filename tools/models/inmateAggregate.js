const { centsToDollars } = require('../scraping/currency');

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

  getBondTotalDescription() {
    const amount = this.bondInformation.reduce((acc, bond) => {
      return acc + bond.amountPennies;
    }, 0);
    return this.bondInformation.some(bond => bond.type.toLowerCase().includes('unbondable')) ? 'unbondable' : centsToDollars(amount);
  }
}

module.exports = InmateAggregate;