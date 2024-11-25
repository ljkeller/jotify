import styles from "../styles/Home.module.css";
import { formatInTimeZone } from "date-fns-tz";

import TrafficCalendar from "./ui/trafficCalendar";
import Search from "/app/ui/search";
import Record from "/app/ui/compressedRecord";
import { runtimeDbConfig } from "/tools/config";

import SqlControllerFactory from "/tools/database/sqlControllerFactory";

export const revalidate = 60 * 30;

const TIMEZONE = "America/Chicago";

async function getLast7DaysInmateTraffic(sqlController) {
  const dateQueries = [];
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    let localDate = new Date();
    localDate.setDate(localDate.getDate() - i);
    const tzDateStr = formatInTimeZone(localDate, TIMEZONE, "yyyy-MM-dd");

    const count = await sqlController.countInmatesOnDate(tzDateStr);
    dateQueries.push(count);
    dates.push(tzDateStr);
  }
  const counts = await Promise.all(dateQueries);
  return dates.map((date, idx) => ({ date, inmateCount: counts[idx] }));
}

export const metadata = {
  title: "scjail.io Home",
  description: "Scott county inmate listing- but better",
};

export default async function Home() {
  const db = new SqlControllerFactory();
  const sqlController = db.getSqlConnection(runtimeDbConfig);

  // TODO: instead of getting inmates for todays date, just grab last N for home page
  const [trafficLast7Days, compressedRecordInfo] = await Promise.all([
    getLast7DaysInmateTraffic(sqlController),
    sqlController.getCompressedInmateDataForDate(
      formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd")
    ),
  ]);

  const compressedRecords = compressedRecordInfo.map((inmate, idx) => (
    <Record key={idx} data={inmate} priority={idx < 5} />
  ));

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

        <div className={styles.records}>{compressedRecords}</div>
      </main>
    </div>
  );
}
