'use client';
import Link from 'next/link';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';

import { addDays, parse, formatISO, add } from 'date-fns';

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

function getNextDayQuery(date) {
  return "/date?date=" + formatISO(addDays(date, 1), { representation: 'date' });
}

function getPrevDayQuery(date) {
  return "/date?date=" + formatISO(addDays(date, -1), { representation: 'date' });
}

export default function DateScroller({ params, searchParams }) {
  let date = null;
  let dateStrIso8601 = null;
  try {
    date = parse(searchParams?.date, 'yyyy-MM-dd', new Date());
  } catch (err) {
    // TODO: specify errors for client here
    // TODO: use central time zone, not just local time zone
    date = new Date();
    date.setHours(0, 0, 0, 0);
    console.log("error parsing date, using today's date: ", date);
  } finally {
    console.log("date before formatISO: ", date);
    dateStrIso8601 = formatISO(date, { representation: 'date' });
    console.log("dateStr after formatISO: ", dateStrIso8601);
  }

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
          <Link className={styles.headerIcon} href={getPrevDayQuery(date)}><SlArrowLeft /></Link>
          {dateStrIso8601}
          <Link className={styles.headerIcon} href={getNextDayQuery(date)}><SlArrowRight /></Link>
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