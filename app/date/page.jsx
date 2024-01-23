import Link from 'next/link';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import Database from 'better-sqlite3';

import { addDays, parse, formatISO } from 'date-fns';
import { getCompressedInmateDataForDate } from '/tools/database/sqliteUtils';
import { config } from '/tools/config';
import DateSorting from '/app/date/dateSorting';

import styles from '/styles/DateScroller.module.css';
import Record from '/app/ui/compressedRecord';

function getNextDayQuery(date) {
  return "/date?date=" + formatISO(addDays(date, 1), { representation: 'date' });
}

function getPrevDayQuery(date) {
  return "/date?date=" + formatISO(addDays(date, -1), { representation: 'date' });
}

export default function DateScroller({ params, searchParams }) {
  let date = null;
  let dateStrIso8601 = null;
  try {
    date = parse(searchParams?.date, 'yyyy-MM-dd', new Date());
  } catch (err) {
    // TODO: specify errors for client here
    // TODO: use central time zone, not just local time zone
    date = new Date();
    date.setHours(0, 0, 0, 0);
  } finally {
    dateStrIso8601 = formatISO(date, { representation: 'date' });
  }

  // TODO: error handle search params
  const db = new Database(config.appReadFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
  const inmateData = getCompressedInmateDataForDate(db, dateStrIso8601);
  db.close();

  // TODO: remove this priority heuristic that makes first 5 records priority
  const records = inmateData.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <Link className={styles.headerIcon} href={getPrevDayQuery(date)}><SlArrowLeft /></Link>
          {dateStrIso8601}
          <Link className={styles.headerIcon} href={getNextDayQuery(date)}><SlArrowRight /></Link>
        </h1>
      </div>
      <DateSorting />
      <div className={styles.records}>
        {records}
      </div>
    </div >
  );
}