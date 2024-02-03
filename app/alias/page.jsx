import Database from 'better-sqlite3';

import { getCompressedInmateDataForAlias } from '/tools/database/sqliteUtils';
import { config } from '/tools/config';
import DateSorting from '/app/date/dateSorting';

import styles from '/styles/AliasScroller.module.css';
import Record from '/app/ui/compressedRecord';

// TODO: Introduce severity sorting
const SORT_OPTIONS = new Set(['name', 'date', 'bond', 'age']);
const SORT_DIRECTIONS = new Set(['asc', 'desc']);
// most recent date first
const defaultSort = { option: 'date', direction: 'desc' };

export default function AliasScroller({ params, searchParams }) {
  console.log(`searchParams: ${JSON.stringify(searchParams)}`);
  if (!searchParams?.alias) {
    return <div>Invalid alias</div>;
  }
  const alias = searchParams.alias;

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
  const inmateData = getCompressedInmateDataForAlias(db, alias, sortConfig);
  db.close();
  // TODO: remove this priority heuristic that makes first 5 records priority?
  // TODO: sort records on client side (cause all should be here)
  const records = inmateData.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          {alias}
        </h1>
      </div>
      <DateSorting routePrefix={`alias?alias=${alias}`} serverSortConfig={sortConfig} />
      <div className={styles.recordsWrapper}>
        <h3 className={styles.miniHeader}>Showing {records.length} records</h3>
        <div className={styles.records}>
          {records}
        </div>
      </div>
    </div >
  );
}