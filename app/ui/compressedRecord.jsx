import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { PiSealWarningFill, PiSubtitlesDuotone } from 'react-icons/pi';
import { TbFlag } from "react-icons/tb";

import styles from '/styles/CompressedRecord.module.css';

const MAX_SHOW_CHARGES = 3

const bufferToBase64 = (buffer) =>
  buffer ? `data:image/jpeg;base64,${buffer.toString('base64')}` : '/anon.png';

export default function CompressedRecord({ data: compressedInmate, priority }) {
  // TODO? lowercase charge data
  const warningIcon = (chargeGrade) => {
    const severity = <PiSealWarningFill />;
    return chargeGrade === 'felony' ? <span className={`${styles.felony} ${styles.severity}`}>{severity}</span> : null;
  };
  const charges = [];
  for (let idx = 0; idx < compressedInmate.chargeInformationArray.length && idx < MAX_SHOW_CHARGES; idx++) {
    charges.push(<li key={idx} className={styles.charge}>{compressedInmate.chargeInformationArray[idx].description}</li>);
  }
  const numHiddenCharges = compressedInmate.chargeInformationArray.length - MAX_SHOW_CHARGES;

  let consumerFormatBookingDate;
  try {
    const bookingDate = parseISO(compressedInmate.bookingDate);
    consumerFormatBookingDate = format(bookingDate, "MMMM d, yyyy 'at' h:mm a");
  } catch (err) {
    console.log("Error parsing booking date: " + err);
    consumerFormatBookingDate = "unknown";
  }

  // TODO: use s3 instead of base64 image
  const image =
    <img
      src={bufferToBase64(compressedInmate.img)}
      width={150}
      height={187}
      alt={`${compressedInmate.fullName} mugshot`}
      className={styles.mugshot}
    />;
  // <Image
  //   // TODO: use s3 instead of precoded image
  //   src={"/in1.jpg"}
  //   width={150}
  //   height={187}
  //   alt={`${compressedInmate.fullName} mugshot`}
  //   className={styles.mugshot}
  //   priority={priority}
  // />
  return (
    <Link className={styles.hiddenLink} href={`/record?id=${compressedInmate.id}`} prefetch={false} >
      <div className={styles.record}>
        {image}
        < div className={styles.headerDetails} >
          <div className={styles.textBox}>
            <div className={styles.nameBox}>
              <h3 className={`${styles.name}`}>
                {warningIcon(compressedInmate.chargeGrade)}
                {compressedInmate.fullName}
              </h3>
              <h4 className={styles.date}>{consumerFormatBookingDate}</h4>
            </div>
            <ul className={styles.charges}>
              {charges}
              {
                compressedInmate.chargeInformationArray.length > MAX_SHOW_CHARGES ? <div className={`${styles.compressedNameBox} ${styles.alertStyle}`}>
                  <TbFlag />
                  {compressedInmate.chargeInformationArray.length > MAX_SHOW_CHARGES ? <span>{numHiddenCharges} more {numHiddenCharges > 1 ? "charges" : "charge"}</span> : null}
                </div>
                  : null
              }
            </ul>
          </div>
        </div >
      </div >
    </Link >
  );
}