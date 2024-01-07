import Image from 'next/image';

import styles from '/styles/CompressedRecord.module.css';

export default function CompressedRecord({ data }) {
    // TODO? lowercase charge data
    const renderChargeSeverity = (chargeGrade) => {
        const severity = chargeGrade === 'felony' ? 'F' : 'M';
        const iconStyle = chargeGrade === 'felony' ? styles.felony : styles.misdemeanor;
        return <span className={`${iconStyle} ${styles.severity}`}>{severity}</span>
    };

    return (
        <div className={styles.record}>
            <Image
                src={data.img}
                width={200}
                height={250}
                alt={`${data.fullName} mugshot`}
                className={styles.mugshot} />
            {renderChargeSeverity(data.chargeGrade)}
            <div className={styles.details}>
                <h2 className={styles.name}>{data.fullName}</h2>
                <p className={styles.date}>{data.bookingDate}</p>
            </div>
        </div>
    );
}