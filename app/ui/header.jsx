import Link from 'next/link';
import styles from '/styles/Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <nav className={styles.navbar}>
                <Link href="/" className={styles.logo}>
                    scjail.io
                </Link>
                <div className={styles.links}>
                    <Link href="/disclaimer" className={styles.link}>
                        Disclaimer
                    </Link>
                    <Link href="/contact" className={styles.link}>
                        Contact
                    </Link>
                </div>
            </nav>
        </header>
    );
}