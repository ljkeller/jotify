import Database from 'better-sqlite3';

import { getCompressedInmateDataForSearchName } from '/tools/database/sqliteUtils';
import { config } from '/tools/config';
import DateSorting from '/app/date/dateSorting';

import styles from '/styles/AliasScroller.module.css';
import Record from '/app/ui/compressedRecord';
import SearchBar from '../ui/search';

// TODO: Introduce severity sorting
const SORT_OPTIONS = new Set(['name', 'date', 'bond', 'age']);
const SORT_DIRECTIONS = new Set(['asc', 'desc']);
// most recent date first
const defaultSort = { option: 'date', direction: 'desc' };

export default function AliasScroller({ params, searchParams }) {
  console.log(`searchParams: ${JSON.stringify(searchParams)}`);
  if (!searchParams?.query) {
    return <div>Invalid search argument!</div>;
  }
  const name = searchParams.query;
  if (name.length < 3) {
    return <div>Search query must be at least 3 characters</div>;
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

  const db = new Database(config.appReadFile, { verbose: console.log, readonly: true });
  const inmateData = getCompressedInmateDataForSearchName(db, name, sortConfig);
  db.close();
  // TODO: sort records on client side (cause all should be here)
  const records = inmateData.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );

  return (
    <div className={styles.container}>
      <SearchBar />
      <div className={styles.header}>
        <h1>
          {name}
        </h1>
      </div>
      <DateSorting routePrefix={`search?query=${encodeURIComponent(name)}`} serverSortConfig={sortConfig} />
      <div className={styles.recordsWrapper}>
        <h3 className={styles.miniHeader}>Showing {records.length} records</h3>
        <div className={styles.records}>
          {records}
        </div>
      </div>
    </div >
  );
}