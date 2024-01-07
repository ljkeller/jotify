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
            <div className={styles.details}>
                <h3 className={styles.name}>
                    {renderChargeSeverity(data.chargeGrade)}

                    {" " + data.fullName}</h3>
                <h4 className={styles.date}>{data.bookingDate}</h4>
            </div>
        </div>
    );
}