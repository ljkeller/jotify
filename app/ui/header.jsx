import Link from 'next/link';
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";

import styles from '/styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <Link className={styles.logo} href="/">
          <span className={styles.complementary}>sc</span>
          jail.io
        </Link>
        <div className={styles.links}>
          <a href="/record" className={styles.logo}><GiPerspectiveDiceSixFacesRandom /></a>
          <Link href="/about" className={styles.link}>
            About
          </Link>
          <Link href="/disclaimer" className={styles.link}>
            Disclaimer
          </Link>
          <Link href="/feedback" className={styles.link}>
            Feedback
          </Link>
        </div>
      </nav>
    </header >
  );
}