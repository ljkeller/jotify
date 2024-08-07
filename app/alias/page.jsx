import SearchBar from "/app/ui/search";
import styles from "/styles/AliasScroller.module.css";
import Record from "/app/ui/compressedRecord";

import { runtimeDbConfig } from "/tools/config";
import DateSorting from "/app/date/dateSorting";
import SqlControllerFactory from "/tools/database/sqlControllerFactory";

export const dynamic = 'force-dynamic';

const SORT_OPTIONS = new Set(["name", "date", "bond", "age"]);
const SORT_DIRECTIONS = new Set(["asc", "desc"]);
// most recent date first
const defaultSort = { option: "date", direction: "desc" };

export default async function AliasScroller({ searchParams }) {
  //console.log(`searchParams: ${JSON.stringify(searchParams)}`);
  if (!searchParams?.query) {
    return <div>Invalid alias</div>;
  }
  const alias = searchParams.query;

  let sortConfig = defaultSort;
  try {
    const sortOption = searchParams?.sort;
    const sortDirection = searchParams?.direction;
    if (SORT_OPTIONS.has(sortOption) && SORT_DIRECTIONS.has(sortDirection)) {
      sortConfig = { option: sortOption, direction: sortDirection };
    }
  } catch (err) {
    console.error("Error parsing sort options: " + err);
  }

  const factory = new SqlControllerFactory();
  const sqlController = factory.getSqlConnection(runtimeDbConfig);
  const inmateData = await sqlController.getCompressedInmateDataForAlias(
    alias,
    sortConfig
  );
  const records = inmateData.map((inmate, idx) => (
    <Record key={idx} data={inmate} priority={idx < 5} />
  ));

  return (
    <div className={styles.container}>
      <SearchBar />
      <div className={styles.header}>
        <h1>{alias}</h1>
      </div>
      <DateSorting
        routePrefix={`alias?query=${alias}`}
        serverSortConfig={sortConfig}
      />
      <div className={styles.recordsWrapper}>
        <h3 className={styles.miniHeader}>Showing {records.length} records</h3>
        <div className={styles.records}>{records}</div>
      </div>
    </div>
  );
}
