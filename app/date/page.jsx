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

const SORT_OPTIONS = new Set(['name', 'date', 'bond', 'age']);
const SORT_DIRECTIONS = new Set(['asc', 'desc']);
// most recent date first
const defaultSort = { option: 'date', direction: 'desc' };

export default function DateScroller({ params, searchParams }) {
  let date = null;
  let dateStrIso8601 = null;
  console.log(`searchParams: ${JSON.stringify(searchParams)}`);
  try {
    date = parse(searchParams?.date, 'yyyy-MM-dd', new Date());
  } catch (err) {
    // TODO: use central time zone, not just local time zone
    date = new Date();
    date.setHours(0, 0, 0, 0);
  } finally {
    dateStrIso8601 = formatISO(date, { representation: 'date' });
  }

  let sortConfig = defaultSort;
  try {
    const sortOption = searchParams?.sort;
    const sortDirection = searchParams?.direction;
    if (SORT_OPTIONS.has(sortOption) && SORT_DIRECTIONS.has(sortDirection)) {
      sortConfig = { option: sortOption, direction: sortDirection };
    }
  } catch (err) {
    console.log("Error parsing sort options: " + err);
  }

  const db = new Database(config.appReadFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
  const inmateData = getCompressedInmateDataForDate(db, dateStrIso8601, sortConfig);
  db.close();
  // TODO: sort records on client side (cause all should be here)
  const records = inmateData.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <Link title="Previous day" className={styles.headerIcon} href={getPrevDayQuery(date)}><SlArrowLeft /></Link>
          {dateStrIso8601}
          <Link title={`Next day`} className={styles.headerIcon} href={getNextDayQuery(date)}><SlArrowRight /></Link>
        </h1>
      </div>
      <DateSorting routePrefix={`/date?date=${dateStrIso8601}`} serverSortConfig={sortConfig} />
      <div className={styles.recordsWrapper}>
        <h3 className={styles.miniHeader}>Showing {records.length} records</h3>
        <div className={styles.records}>
          {records}
        </div>
      </div>
    </div >
  );
}