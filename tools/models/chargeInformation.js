class CrimeSeverity {
  static FELONY = 'felony';
  static MISDEMEANOR = 'misdemeanor';

  static fromString(severity) {
    switch (severity) {
      case 'felony':
        return CrimeSeverity.FELONY;
      case 'misdemeanor':
        return CrimeSeverity.MISDEMEANOR;
      default:
        console.warn(`Unknown crime severity: ${severity}. Defaulting to misdemeanor.`);
        return CrimeSeverity.MISDEMEANOR;
    }
  }
}

class ChargeInformation {
  constructor(
    description,
    grade,
    offenseDate,
  ) {
    this.description = description;
    this.grade = grade;
    this.offenseDate = offenseDate;
  }
}

module.exports = ChargeInformation, CrimeSeverity;