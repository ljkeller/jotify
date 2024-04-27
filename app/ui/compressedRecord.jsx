import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { PiSealWarningFill, PiSubtitlesDuotone } from 'react-icons/pi';
import { MdIosShare } from "react-icons/md";
import { BiBarChart } from "react-icons/bi";
import { MdAttachMoney } from "react-icons/md";
import { TbFlag } from "react-icons/tb";

import styles from '/styles/CompressedRecord.module.css';
import { centsToDollars } from '/tools/scraping/currency';

const MAX_SHOW_CHARGES = 3

const bufferToBase64 = (buffer) =>
  buffer ? `data:image/jpeg;base64,${buffer.toString('base64')}` : '/anon.png';

export default function CompressedRecord({ data: compressedInmate, priority }) {
  // TODO? lowercase charge data
  const warningIcon = (chargeGrade) => {
    const severity = <PiSealWarningFill title="Felony" />;
    return chargeGrade.toLowerCase() === 'felony' ? <span className={`${styles.felony} ${styles.severity}`}>{severity}</span> : null;
  };
  const charges = [];
  for (let idx = 0; idx < compressedInmate.chargeInformationArray.length && idx < MAX_SHOW_CHARGES; idx++) {
    charges.push(<li key={idx} className={styles.charge}>{compressedInmate.chargeInformationArray[idx].description}</li>);
  }
  const numHiddenCharges = compressedInmate.chargeInformationArray.length - MAX_SHOW_CHARGES;

  let consumerFormatBookingDate;
  try {
    consumerFormatBookingDate = format(compressedInmate.bookingDate, "MMMM d, yyyy 'at' h:mm a");
  } catch (err) {
    console.log("Error parsing booking date: " + err);
    consumerFormatBookingDate = "unknown";
  }

  let bond = compressedInmate.bondPennies;
  bond = bond ? bond : 0;
  bond = bond === Number.MAX_SAFE_INTEGER ? 'UNBONDABLE' : centsToDollars(bond).substr(1);

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

  // TODO! Implement sharing
  return (
    <Link className={styles.hiddenLink} href={`/record?id=${compressedInmate.id}`} prefetch={false} >
      <div className={styles.record}>
        <div className={styles.mugshotDetailsContainer}>
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
        </div>
        <div className={styles.footerAnalytics}>
          <div className={styles.iconPair}>
            <MdAttachMoney title='Bond total' className={styles.analyticsIcon} />
            <span className={styles.analytics}> {bond}</span>
          </div>
          <div className={styles.iconPair}>
            <BiBarChart title='views' className={styles.analyticsIcon} />
            <span className={styles.analytics}> {Math.floor(Math.random() * 1000)} views, {Math.floor(Math.random() * 140)} shares</span>
          </div>
          <MdIosShare title='share' className={styles.analyticsIcon} />
        </div>
      </div >
    </Link >
  );
}