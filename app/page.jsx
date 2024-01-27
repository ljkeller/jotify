import { RiUserSearchFill } from "react-icons/ri";
import { FaMask } from 'react-icons/fa';

import styles from '../styles/Home.module.css'
import Database from 'better-sqlite3';
import { formatISO } from 'date-fns';

import TrafficCalendar from './ui/trafficCalendar';
import Record from '/app/ui/compressedRecord';
import { config } from '/tools/config';
import { countInmatesOnDate, getCompressedInmateDataForDate } from "/tools/database/sqliteUtils";

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