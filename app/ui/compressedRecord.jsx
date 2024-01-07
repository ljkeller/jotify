import Image from 'next/image';
import Link from 'next/link';
import { PiSealWarningFill } from 'react-icons/pi';

import styles from '/styles/CompressedRecord.module.css';

export default function CompressedRecord({ data, priority }) {
    // TODO? lowercase charge data
    const warningIcon = (chargeGrade) => {
        const severity = <PiSealWarningFill />;
        return chargeGrade === 'felony' ? <span className={`${styles.felony} ${styles.severity}`}>{severity}</span> : null;
    };
    const charges = data.charges.map((charge, idx) =>
        <li key={idx} className={styles.charge}>{charge}</li>
    );

    return (
        <Link className={styles.hiddenLink} href="/record" prefetch={false}>
            <div className={styles.record}>
                <Image
                    src={data.img}
                    width={150}
                    height={187}
                    alt={`${data.fullName} mugshot`}
                    className={styles.mugshot}
                    priority={priority}
                />
                <div className={styles.headerDetails}>
                    <h3 className={styles.name}>
                        {warningIcon(data.chargeGrade)}
                        {data.fullName}</h3>
                    <h4 className={styles.date}>{data.bookingDate}</h4>
                    <ul className={styles.charges}>
                        {charges}
                    </ul>
                </div>
            </div>
        </Link>

    );
}