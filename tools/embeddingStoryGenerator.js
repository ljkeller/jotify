const Database = require('better-sqlite3');
const { format } = require('date-fns');

const { config } = require('./config');
const { getInmateAggregateData } = require('./database/sqliteUtils');

async function main() {
  const db = new Database(config.appReadFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
  try {
    const inmate = getInmateAggregateData(db).inmateAggregate;
    inmate.inmateProfile.imgBlob = 0;
    console.log(JSON.stringify(inmate, null, 2));

    const sexDescription = inmate.inmateProfile.sex.toLowerCase() === 'male' ? 'man' : 'woman';
    const aliasSentence = inmate.inmateProfile.aliases.length > 0 ? `${inmate.inmateProfile.first} is known to use the following aliases: ${inmate.inmateProfile.aliases.join(', ')}.` : 'No known aliases.';

    const intro = `A ${inmate.inmateProfile.race} ${sexDescription} named ${inmate.inmateProfile.getFullName()} was arrested on ${format(inmate.inmateProfile.bookingDateIso8601, "MMMM d, yyyy 'at' h:mm a")} by ${inmate.inmateProfile.arrestingAgency}.`;
    console.log(intro);
    const charges = inmate.chargeInformation.map(charge => charge.description).join(', ');
    // TODO: fix amount by moving calculations into bondInformation class
    console.log(`Charges include ${charges}. Bond is set at ${inmate.bondInformation.amount}.`);
    const description = `${inmate.inmateProfile.first} is described as ${inmate.inmateProfile.height} tall, weighing ${inmate.inmateProfile.weight}, and having ${inmate.inmateProfile.eyeColor}. ${aliasSentence}`;
    console.log(description);
    const ids = `The inmate's booking number is ${inmate.inmateProfile.bookingNumber}, and their permanent ID is ${inmate.inmateProfile.permanentId}.`;
    console.log(ids);

  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

main();