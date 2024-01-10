class InmateProfile {
    constructor(
        first,
        middle,
        last,
        affix,
        permanentId,
        sex,
        dob,
        ageAtBooking,
        height,
        weight,
        race,
        eye_color,
        aliases,
        imgBlob,
    ) {
        this.first = first;
        this.middle = middle;
        this.last = last;
        this.affix = affix;
        this.permanentId = permanentId;
        this.sex = sex;
        this.dob = dob;
        this.ageAtBooking = ageAtBooking;
        this.height = height;
        this.weight = weight;
        this.race = race;
        this.eye_color = eye_color;
        this.aliases = aliases;
        this.imgBlob = imgBlob;
    }
}

module.exports = InmateProfile;