import Image from 'next/image';
import Link from 'next/link';
import { FaMask } from 'react-icons/fa';
import Database from 'better-sqlite3';

import styles from '/styles/Record.module.css';
import { config } from '/tools/config';

import { getInmateAggregateData } from '/tools/database/sqliteUtils';
import ChargeInformation from '/tools/models/chargeInformation';
import BondInformation from '/tools/models/bondInformation';
import InmateAggregate from '/tools/models/inmateAggregate'
import InmateProfile from '/tools/models/inmateProfile';

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

export default function Record({ record, searchParams }) {
  const recommended = getRecommended();

  let inmate;
  try {
    const db = new Database(config.appReadFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
    try {
      const queryId = parseInt(searchParams.id);
      inmate = getInmateAggregateData(db, queryId);
    } catch (err) {
      console.log(err);
      // TODO: return error page / val
      return <div>Oops, something went wrong</div>;
    } finally {
      db.close();
    }
  } catch (err) {
    // TODO: error handling (code around 500) + styling
    console.log(err);
    return <h1>Oops, something went wrong on our end</h1>;
  }

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
          <div className={styles.iconHeader}>
            <FaMask className={styles.icon} />
            <h3 className={styles.secondaryHeader}>Aliases</h3>
          </div>
          <div className={styles.aliasDivider}>
            {inmate.inmateProfile.aliases.map((alias, idx) =>
              <Link href={`/alias/${alias}`} prefetch={false} key={idx} className={styles.aliasLink}>{alias}</Link>
            )}
          </div>
        </div>

        <div className={styles.chargeInformation}>
          <h3 className={styles.secondaryHeader}>Charges</h3>
          <table className={styles.inmateTable}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Offense Date</th>
                <th className={styles.tableHeader}>Description</th>
                <th className={styles.tableHeader}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {inmate.chargeInformation.map((charge, index) => (
                <tr className={styles.tableRow} key={index}>
                  <td className={styles.tableData}>{charge.offenseDate}</td>
                  <td className={styles.tableData}>{charge.description}</td>
                  <td className={styles.tableData}>{charge.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.bondInformation}>
          <h3 className={styles.secondaryHeader}>Bond</h3>
          <table className={styles.inmateTable}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Type</th>
                <th className={styles.tableHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inmate.bondInformation.map((bond, index) => (
                <tr className={styles.tableRow} key={index}>
                  <td className={styles.tableData}>{bond.type}</td>
                  <td className={styles.tableData}>{bond.amountPennies}</td>
                </tr>
              ))}
            </tbody>
          </table>
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