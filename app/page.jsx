import Database from 'better-sqlite3';

import Inmate from '../tools/models/Inmate';
import { tables } from '../tools/config';

import styles from '../styles/Home.module.css'

export default function Home() {
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

        <div className={styles.icons}>
        </div>
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}