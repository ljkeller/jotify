import styles from '/styles/Last7Days.module.css';

export default function last7Days({ inmateTraffic7Days }) {
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
                <tr>
                    {inmateTraffic7Days.map((amount, index) => (
                        <td
                            key={index}
                            className={`${getColor(amount)} ${styles.dayCell}`}
                            title={`Traffic: ${amount}%`}
                        />))}
                </tr>
            </tbody>
        </table >
    );
}