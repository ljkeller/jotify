import Link from 'next/link';

import styles from '/styles/TrafficCalendar.module.css';

export default function TrafficCalendar({ inmateTraffic7Days }) {
  const getColor = (amount) => {
    if (amount > 25) return styles.veryHigh;
    if (amount > 18) return styles.high;
    if (amount > 8) return styles.medium;
    if (amount > 0) return styles.low;
    return styles.none;
  }

  return (
    <>
      {/* <a className={styles.trafficExplanation}>{`${inmateTraffic7Days.map((day) => day.inmateCount).reduce((a, b) => a + b)} inmates in the last week`}</a> */}
      <div className={styles.outerDetails}>
        <div className={styles.bookingHeaderContainer}>
          <h3 className={styles.bookingHeader}>{`Booking frequency last 7 days`}</h3>
          <a className={styles.bookingDetails} > {`${inmateTraffic7Days.map((day) => day.inmateCount).reduce((a, b) => a + b)} bookings`}</a>
        </div>
        <div className={styles.innerDetails}>
          <a className={styles.date}>{`${inmateTraffic7Days[0].date}`}</a>
          <a className={styles.date}>{`${inmateTraffic7Days[inmateTraffic7Days.length - 1].date}`}</a>
        </div>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.row}>
              {inmateTraffic7Days.map((day, index) => (
                <Link href={`/date?date=${day.date}`} key={index}>
                  <td
                    key={index}
                    className={`${getColor(day.inmateCount)} ${styles.dayCell}`}
                    title={`${day.inmateCount} inmates on ${day.date}`}
                  />
                </Link>
              ))}
            </tr>
          </tbody>
        </table >
        <div className={styles.key}>
          <span className={`${styles.keyLabel} ${styles.lessLabel}`}>less</span>
          <div className={`${styles.none} ${styles.keyCell}`}></div>
          <div className={`${styles.low} ${styles.keyCell}`}></div>
          <div className={`${styles.medium} ${styles.keyCell}`}></div>
          <div className={`${styles.high} ${styles.keyCell}`}></div>
          <div className={`${styles.veryHigh} ${styles.keyCell}`}></div>
          <span className={`${styles.keyLabel} ${styles.moreLabel}`}>more</span>
        </div>
      </div >

    </>


  );
}