import styles from '../styles/Home.module.css'
import Image from 'next/image';
import Database from 'better-sqlite3';

import Inmate from '../tools/models/Inmate';
import { tables } from '../tools/config';
import TrafficCalendar from './ui/trafficCalendar';
import Record from '/app/ui/compressedRecord';

function getInmateData() {
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

export const metadata = {
  title: 'scjail.io Home',
  description: 'Scott county inmate listing- but better',
}

export default function Home() {
  const trafficLast7Days = [
    { date: "1/1/24", inmateCount: 13 },
    { date: "1/2/24", inmateCount: 16 },
    { date: "1/3/24", inmateCount: 19 },
    { date: "1/4/24", inmateCount: 26 },
    { date: "1/5/24", inmateCount: 23 },
    { date: "1/6/24", inmateCount: 19 },
    { date: "1/7/24", inmateCount: 16 },
  ];

  const inmateData = getInmateData();
  // TODO: remove this priority heuristic that makes first 5 records priority
  const records = inmateData.map((inmate, idx) =>
    <Record key={idx} data={inmate} priority={idx < 5} />
  );

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.complementary}>sc</span>
          <span>jail.io</span>
        </h1>

        <div className={styles.search}>
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div>


        <div className={styles.icons}></div>
        <div className={styles.grid7Days}>
          <TrafficCalendar inmateTraffic7Days={trafficLast7Days} />
        </div>

        <div className={styles.records}>
          {records}
        </div>
      </main>
    </div>
  )
}