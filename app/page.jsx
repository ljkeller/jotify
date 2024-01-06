import styles from '../styles/Home.module.css'
import Image from 'next/image';
import Database from 'better-sqlite3';

import Inmate from '../tools/models/Inmate';
import { tables } from '../tools/config';
import TrafficCalendar from './ui/trafficCalendar';


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

        <div className={styles.grid7Days}>
          <TrafficCalendar inmateTraffic7Days={trafficLast7Days} />
        </div>

        <div className={styles.icons}>
          <Image
            src='/in1.jpg'
            width={200}
            height={250}
            className={`${styles.iconImage} hidden md:block`}
            alt="sample inmate"
          />
          <Image
            src='/in2.jpg'
            width={200}
            height={250}
            className={`${styles.iconImage} hidden md:block`}
            alt="sample inmate"
          />
          <Image
            src='/in3.jpg'
            width={200}
            height={250}
            className={`${styles.iconImage} hidden md:block`}
            alt="sample inmate"
          />
        </div>
      </main>
    </div>
  )
}