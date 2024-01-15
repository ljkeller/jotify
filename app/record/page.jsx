import Image from 'next/image';
import Link from 'next/link';

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
    ["Ash", "Ash", "Ashy", "Ashy K", "Shakina", "Ashy", "Ashy K", "Shakina", "Shakina K", "Shakina Kellenberger"],
    null,
  );
  return new InmateAggregate(
    inmateProfile,
    bondInformation,
    chargeInformation,
  );
}

function getRecommended() {
  return [
    {
      firstLast: "DERRICK GULLEY",
      imgPath: "/in2.jpg"
    },
    {
      firstLast: "GUADALUPE PADAVICH",
      imgPath: "/in3.jpg"
    }
  ];
}

export default function Record({ record }) {
  const inmate = getInmate();
  const recommended = getRecommended();
  return (
    <div className={styles.recordOuter}>
      <div className={styles.profileSidebar}>
        <Image
          src='/in1.jpg'
          width={300}
          height={375}
          className={styles.profileImage}
          alt='inmate image'
          priority={true}
        ></Image>
        <div className={styles.profileContainer}>

          <h3 className={styles.primaryHeader}>Profile</h3>
          <div className={styles.kvProfile}>
            <div className={styles.kvContainer}>
              <div className={styles.key}>First: </div>
              <div className={styles.value}>{inmate.inmateProfile.first}</div>
            </div><div className={styles.kvContainer}>
              <div className={styles.key}>Middle: </div>
              <div className={styles.value}>{inmate.inmateProfile.middle}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Last: </div>
              <div className={styles.value}>{inmate.inmateProfile.last}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Affix: </div>
              <div className={styles.value}>{inmate.inmateProfile.affix}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Permanent ID: </div>
              <div className={styles.value}>{inmate.inmateProfile.permanentId}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Sex: </div>
              <div className={styles.value}>{inmate.inmateProfile.sex}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Date of birth: </div>
              <div className={styles.value}>{inmate.inmateProfile.dob}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Height: </div>
              <div className={styles.value}>{inmate.inmateProfile.height}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Weight: </div>
              <div className={styles.value}>{inmate.inmateProfile.weight}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Race: </div>
              <div className={styles.value}>{inmate.inmateProfile.race}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Eye Color: </div>
              <div className={styles.value}>{inmate.inmateProfile.eyeColor}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.inmateRecordColumn}>
        <h1 className={`${styles.inmateName}`}>{inmate.inmateProfile.getFullName()}</h1>
        <div className={styles.aliasHeaderContainer}>
          <h3 className={styles.secondaryHeader}>🎭Aliases</h3>
          <div className={styles.aliasDivider}>
            {inmate.inmateProfile.aliases.map((alias, idx) =>
              <Link href={`/alias/${alias}`} prefetch={false} key={idx} className={styles.aliasLink}>{alias}</Link>
            )}
          </div>
        </div>
        <div className={styles.chargeInformation}>
          <h3 className={styles.secondaryHeader}>Charges</h3>
          <ul className={styles.chargeList}>
            {inmate.chargeInformation.map((charge, idx) =>
              <li key={idx}>{charge.offenseDate + " " + charge.description + " " + charge.grade}</li>
            )}
          </ul>
        </div>
        <div className={styles.bondInformation}>
          <h3 className={styles.secondaryHeader}>Bond</h3>
          <ul className={styles.bondList}>
            {inmate.bondInformation.map((bond, idx) =>
              <li key={idx}>{bond.type + " $" + bond.amountPennies}</li>
            )}
          </ul>
        </div>
      </div>

      <div className={styles.recommendedSidebar}>
        <h2 className={styles.primaryHeader}>Related</h2>
        {recommended.map((inmate, idx) =>
          <div key={idx} className={styles.recommendedContainer}>
            <Image className={styles.recommendedImg} src={inmate.imgPath} width={40} height={50} alt={`${styles.firstLast} img`} />
            <Link className={`${styles.hiddenLink} ${styles.recommendedLink}`} href="/record" >{inmate.firstLast}</Link>
          </div>
        )}
      </div>
    </ div >
  );
}