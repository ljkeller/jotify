'use client';
import Link from 'next/link';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';

import styles from '/styles/DateScroller.module.css';
import Record from '/app/ui/compressedRecord';

// TODO: get inmate data from db
function getInmateData(date) {
  const r1 = {
    fullName: 'ASHTIN SHAKINA KELLENBERGER',
    bookingDate: '1/4/2024 6:06 PM',
    bond: "$2,500.00",
    age: 30,
    img: '/in1.jpg',
    chargeGrade: 'misdemeanor',
    charges: [
      "DRIVE WHILE REVOKED",
      "DRIVING WHILE BARRED",
      "DUS",
      "LEAVE SCENE OF ACCIDENT",
      "TURN SIGNAL"
    ]
  };
  const r2 = {
    fullName: 'DERRICK LORENZO GULLEY',
    bookingDate: '1/3/2024 7:58 PM',
    bond: "$600.00",
    age: 54,
    img: '/in2.jpg',
    chargeGrade: 'felony',
    charges: [
      "HARASSMENT FIRST DEGREE"
    ]
  };
  const r3 = {
    fullName: 'GUADALUPE ECTOR PADAVICH',
    bookingDate: '1/4/2024 10:53 AM',
    bond: "$1,000.00",
    age: 44,
    img: '/in3.jpg',
    chargeGrade: 'misdemeanor',
    charges: [
      "INTERFER W/OFFOCIAL ACTS",
      "INTOXICATION"
    ]
  };

  return [r1, r2, r3];
}

export default function DateScroller({ params, searchParams }) {

  console.log(params);
  console.log(searchParams);

  const date = searchParams?.date || new Date().toLocaleDateString();
  // TODO: error handle search params
  const inmateData = getInmateData(date);
  // TODO: remove this priority heuristic that makes first 5 records priority
  const records = inmateData.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );

  const handleFilterClick = (filterType) => {
    console.log(filterType);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <Link className={styles.headerIcon} href="/date"><SlArrowLeft /></Link>
          {date}
          <Link className={styles.headerIcon} href="/date"><SlArrowRight /></Link>
        </h1>
      </div>
      <div className={styles.filters}>
        <button className={styles.inactiveFilter} onClick={() => handleFilterClick('name')}>Name</button>
        <button className={styles.activeFilter} onClick={() => handleFilterClick('bookingDate')}>Booking Date</button>
        <button className={styles.inactiveFilter} onClick={() => handleFilterClick('bond')}>Bond $</button>
        <button className={styles.inactiveFilter} onClick={() => handleFilterClick('age')}>Age</button>
      </div>
      <div className={styles.records}>
        {records}
      </div>
    </div >
  );
}