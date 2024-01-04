import Database from 'better-sqlite3';

import LikeButton from './like-button';
import Inmate from '../tools/models/Inmate';
import { tables } from '../tools/config';

// pages/index.js
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Jotify.io</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Jotify.io
        </h1>

        <div className={styles.search}>
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div>

        <div className={styles.icons}>
          {/* Place your icons here */}
        </div>
      </main>

      <footer className={styles.footer}>
        {/* Footer content */}
      </footer>
    </div>
  )
}