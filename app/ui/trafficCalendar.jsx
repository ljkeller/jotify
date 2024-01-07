import Link from 'next/link';

import styles from '/styles/Last7Days.module.css';

export default function TrafficCalendar({ inmateTraffic7Days }) {
    const getColor = (amount) => {
        if (amount > 25) return styles.veryHigh;
        if (amount > 15) return styles.high;
        if (amount > 5) return styles.medium;
        if (amount > 0) return styles.low;
        return styles.none;
    }

    return (
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
    );
}