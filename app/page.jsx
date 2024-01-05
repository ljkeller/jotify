import styles from '../styles/Home.module.css'
import Image from 'next/image';
import Database from 'better-sqlite3';

import Inmate from '../tools/models/Inmate';
import { tables } from '../tools/config';
import Last7Days from './ui/last7days';


export default function Home() {
  const trafficLast7Days = [10, 14, 23, 21, 16, 18, 21];

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h1 className={styles.title}>
          jotify.io
        </h1>

        <div className={styles.search}>
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div>

        <div className={styles.grid7days}>
          <Last7Days inmateTraffic7Days={trafficLast7Days} />
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

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}