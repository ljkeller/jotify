import Link from 'next/link';

import styles from '/styles/TrafficCalendar.module.css';

export default function TrafficCalendar({ inmateTraffic7Days }) {
    const getColor = (amount) => {
        if (amount > 25) return styles.veryHigh;
        if (amount > 15) return styles.high;
        if (amount > 5) return styles.medium;
        if (amount > 0) return styles.low;
        return styles.none;
    }

    return (
        <>
            <a className={styles.trafficExplanation}>{`${inmateTraffic7Days.map((day) => day.inmateCount).reduce((a, b) => a + b)} inmates in the last week`}</a>
            <div className={styles.outerDetails}>
                <div className={styles.innerDetails}>
                    <a>{`${inmateTraffic7Days[0].date}`}</a>
                    <a>{`${inmateTraffic7Days[inmateTraffic7Days.length - 1].date}`}</a>
                </div>
                <table className={styles.table}>
                    <tbody>
                        <tr className={styles.row}>
                            {inmateTraffic7Days.map((day, index) => (
                                // TODO: link to specific date
                                <Link href={`/date`} key={index}>
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
            </div>

        </>


    );
}