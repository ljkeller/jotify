import { RiUserSearchFill } from "react-icons/ri";
import { FaMask } from 'react-icons/fa';

import styles from '../styles/Home.module.css'
import Database from 'better-sqlite3';
import { formatISO } from 'date-fns';

import TrafficCalendar from './ui/trafficCalendar';
import Record from '/app/ui/compressedRecord';
import { config } from '/tools/config';
import { countInmatesOnDate, getCompressedInmateDataForDate } from "/tools/database/sqliteUtils";

function getInmateData() {
  const r1 = {
    fullName: 'ASHTIN SHAKINA KELLENBERGER',
    bookingDate: '1/4/2024 6:06 PM',
    bond: "$2,500.00",
    age: 30,
    img: '/in1.jpg',
    chargeGrade: 'misdemeanor',
    charges: [
      "DRIVE WHILE REVOKED",
      "DRIVING WHILE BARRED",
      "DUS",
      "LEAVE SCENE OF ACCIDENT",
      "TURN SIGNAL"
    ]
  };
  const r2 = {
    fullName: 'DERRICK LORENZO GULLEY',
    bookingDate: '1/3/2024 7:58 PM',
    bond: "$600.00",
    age: 54,
    img: '/in2.jpg',
    chargeGrade: 'felony',
    charges: [
      "HARASSMENT FIRST DEGREE"
    ]
  };
  const r3 = {
    fullName: 'GUADALUPE ECTOR PADAVICH',
    bookingDate: '1/4/2024 10:53 AM',
    bond: "$1,000.00",
    age: 44,
    img: '/in3.jpg',
    chargeGrade: 'misdemeanor',
    charges: [
      "INTERFER W/OFFOCIAL ACTS",
      "INTOXICATION"
    ]
  };

  return [r1, r2, r3];
}

function getLast7DaysInmateTraffic(db) {
  const traffic = [];
  for (let i = 6; i >= 0; i--) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatISO(date, { representation: 'date' });
    traffic.push({ date: dateStr, inmateCount: countInmatesOnDate(db, dateStr) });
  }
  return traffic;
}

export const metadata = {
  title: 'scjail.io Home',
  description: 'Scott county inmate listing- but better',
}

export default function Home() {
  const db = new Database(config.appReadFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
  const trafficLast7Days = getLast7DaysInmateTraffic(db);

  const compressedRecordInfo = getCompressedInmateDataForDate(db, formatISO(new Date(), { representation: 'date' }));
  const compressedRecords = compressedRecordInfo.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );
  db.close();

  const inmateData = getInmateData();
  // TODO: remove this priority heuristic that makes first 5 records priority
  const records = inmateData.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.complementary}>sc</span>
          <span>jail.io</span>
        </h1>

        <div className={styles.searchOptionsContainer}>
          <FaMask className={`${styles.searchIcon} ${styles.complementary}`} />
          <div className={styles.search}>
            <RiUserSearchFill className={styles.searchIcon} />
            <input type="text" placeholder="Search by name..." />
          </div>
        </div>

        <div className={styles.icons}></div>
        <div className={styles.grid7Days}>
          <TrafficCalendar inmateTraffic7Days={trafficLast7Days} />
        </div>

        <div className={styles.records}>
          {compressedRecords}
        </div>
      </main >
    </div >
  )
}