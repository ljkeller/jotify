import Image from 'next/image';
import Link from 'next/link';
import { PiSealWarningFill, PiSubtitlesDuotone } from 'react-icons/pi';
import { TbFlag } from "react-icons/tb";

import styles from '/styles/CompressedRecord.module.css';

const MAX_SHOW_CHARGES = 3

export default function CompressedRecord({ data, priority }) {
  // TODO? lowercase charge data
  const warningIcon = (chargeGrade) => {
    const severity = <PiSealWarningFill />;
    return chargeGrade === 'felony' ? <span className={`${styles.felony} ${styles.severity}`}>{severity}</span> : null;
  };
  const charges = [];
  for (let idx = 0; idx < data.chargeInformationArray.length && idx < MAX_SHOW_CHARGES; idx++) {
    charges.push(<li key={idx} className={styles.charge}>{data.chargeInformationArray[idx].description}</li>);
  }
  const numHiddenCharges = data.chargeInformationArray.length - MAX_SHOW_CHARGES;

  return (
    <Link className={styles.hiddenLink} href="/record" prefetch={false}>
      <div className={styles.record}>
        <Image
          // TODO: use s3 instead of precoded image
          src={"/in1.jpg"}
          width={150}
          height={187}
          alt={`${data.fullName} mugshot`}
          className={styles.mugshot}
          priority={priority}
        />
        <div className={styles.headerDetails}>
          <div className={styles.textBox}>
            <div className={styles.nameBox}>
              <h3 className={`${styles.name}`}>
                {warningIcon(data.chargeGrade)}
                {data.fullName}
              </h3>
            </div>
            <h4 className={styles.date}>{data.bookingDate}</h4>
            <ul className={styles.charges}>
              {charges}
              {
                data.chargeInformationArray.length > MAX_SHOW_CHARGES ? <div className={`${styles.compressedNameBox} ${styles.alertStyle}`}>
                  <TbFlag />
                  {data.chargeInformationArray.length > MAX_SHOW_CHARGES ? <span>{numHiddenCharges} more {numHiddenCharges > 1 ? "charges" : "charge"}</span> : null}
                </div>
                  : null
              }
            </ul>
          </div>
        </div>
      </div >
    </Link >

  );
}