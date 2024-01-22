class CrimeSeverity {
  static FELONY = 'felony';
  static MISDEMEANOR = 'misdemeanor';

  static fromString(severity) {
    switch (severity.toLowerCase()) {
      case 'felony':
        return CrimeSeverity.FELONY;
      case 'misdemeanor':
        return CrimeSeverity.MISDEMEANOR;
      default:
        console.warn(`Unknown crime severity: ${severity}. Defaulting to empty.`);
        return "";
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
    this.grade = CrimeSeverity.fromString(grade);
    this.offenseDate = offenseDate;
  }
}

module.exports = ChargeInformation, CrimeSeverity;