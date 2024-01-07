import Image from 'next/image';
import { PiSealWarningFill } from 'react-icons/pi';

import styles from '/styles/CompressedRecord.module.css';

export default function CompressedRecord({ data }) {
    // TODO? lowercase charge data
    const warningIcon = (chargeGrade) => {
        const severity = <PiSealWarningFill />;
        return chargeGrade === 'felony' ? <span className={`${styles.felony} ${styles.severity}`}>{severity}</span> : null;
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
                    {warningIcon(data.chargeGrade)}

                    {data.fullName}</h3>
                <h4 className={styles.date}>{data.bookingDate}</h4>
            </div>
        </div>
    );
}