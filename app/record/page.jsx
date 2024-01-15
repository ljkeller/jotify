import Image from 'next/image';

import styles from '/styles/Record.module.css';

import ChargeInformation from '/tools/models/chargeInformation';
import BondInformation from '/tools/models/bondInformation';
import InmateAggregate from '/tools/models/inmateAggregate'
import InmateProfile from '/tools/models/inmateProfile';

function getInmate() {
  const bondInformation = [new BondInformation("foo", 100000), new BondInformation("bar", 500000)];
  const chargeInformation = [
    new ChargeInformation("DRIVE WHILE REVOKED", "Misdemeanor", "2019-01-01"),
    new ChargeInformation("DRIVING WHILE BARRED", "Misdemeanor", "2019-01-01"),
    new ChargeInformation("DUS", "Misdemeanor", "2019-01-01"),
    new ChargeInformation("LEAVE SCENE OF ACCIDENT", "Misdemeanor", "2019-01-01"),
    new ChargeInformation("TURN SIGNAL", "Misdemeanor", "2019-01-01"),
  ];
  const inmateProfile = new InmateProfile(
    "Ashtin",
    "Shakina",
    "Kellenberger",
    "",
    "11123-88",
    "Female",
    "1988-02-14",
    "DPD",
    "1/4/2024 6:06 PM",
    "18067",
    "5' 6\"",
    "130",
    "white",
    "brown",
    ["Ash", "Ashy", "Ashy K", "Shakina", "Shakina K", "Shakina Kellenberger"],
    null,
  );
  return new InmateAggregate(
    inmateProfile,
    bondInformation,
    chargeInformation,
  );
}

export default function Record({ record }) {
  const inmate = getInmate();
  return (
    <div className={styles.recordOuter}>
      <div className={styles.profileSidebar}>
        <div className={styles.profileContainer}>
          <Image
            src='/in1.jpg'
            width={300}
            height={375}
            className={styles.profileImage}
            alt='inmate image'
            priority={true}
          ></Image>
          <h3>Profile</h3>
          <div>
            <div className={styles.profileRow}>first: </div>
          </div>
        </div>
      </div>

      <div className={styles.inmateRecordColumn}>
        <h1>{inmate.inmateProfile.getFullName()}</h1>
        <div className={styles.aliasContainer}>
          <h3>Also Known As</h3>
          <ul className={styles.aliasList}>
            {inmate.inmateProfile.aliases.map((alias, idx) =>
              <li key={idx}>{alias}</li>
            )}
          </ul>
        </div>
        <div className={styles.ChargeInformation}>
          <h3>Charges</h3>
          <ul className={styles.chargeList}>
            {inmate.chargeInformation.map((charge, idx) =>
              <li key={idx}>{charge.offenseDate + " " + charge.description + " " + charge.grade}</li>
            )}
          </ul>
        </div>
        <div className={styles.bondInformation}>
          <h3>Bond</h3>
          <ul className={styles.bondList}>
            {inmate.bondInformation.map((bond, idx) =>
              <li key={idx}>{bond.type + " $" + bond.amountPennies}</li>
            )}
          </ul>
        </div>
      </div>

      <div className={styles.recommendedSidebar}>
        <h2>Related</h2>
      </div>
    </ div >
  );
}