import Link from 'next/link';
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