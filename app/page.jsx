import { RiUserSearchFill } from "react-icons/ri";
import { FaMask } from 'react-icons/fa';

import styles from '../styles/Home.module.css'
import Database from 'better-sqlite3';
import { formatISO } from 'date-fns';

import TrafficCalendar from './ui/trafficCalendar';
import Search from '/app/ui/search';
import Record from '/app/ui/compressedRecord';
import { config } from '/tools/config';

// TODO: use strategy pattern/ambigious interface for these functions, and others like it
// In other words, time to make a /tools/database/abstract.js or similar
// import { countInmatesOnDate, getCompressedInmateDataForDate } from "/tools/database/sqliteUtils";
import { countInmatesOnDate, getCompressedInmateDataForDate, psql } from "/tools/database/postgreSqlUtils";

async function getLast7DaysInmateTraffic(db) {
  const traffic = [];
  for (let i = 6; i >= 0; i--) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatISO(date, { representation: 'date' });
    const count = await countInmatesOnDate(db, dateStr);
    traffic.push({ date: dateStr, inmateCount: count});
  }
  return traffic;
}

export const metadata = {
  title: 'scjail.io Home',
  description: 'Scott county inmate listing- but better',
}

export default async function Home() {
  // const db = new Database(config.appReadFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
  const db = psql;
  const trafficLast7Days = await getLast7DaysInmateTraffic(db);

  const compressedRecordInfo = await getCompressedInmateDataForDate(db, formatISO(new Date(), { representation: 'date' }));
  const compressedRecords = compressedRecordInfo.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );
  // db.close();

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.complementary}>sc</span>
          <span>jail.io</span>
        </h1>

        <Search />
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