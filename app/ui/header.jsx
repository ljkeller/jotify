import Link from 'next/link';
import styles from '/styles/Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <nav className={styles.navbar}>
                <Link href="/">
                    <p className={styles.logo}>jotify.io</p>
                </Link>
                <div className={styles.links}>
                    <Link href="/disclaimer">
                        <p>Disclaimer</p>
                    </Link>
                    <Link href="/contact">
                        <p>Contact</p>
                    </Link>
                </div>
            </nav>
        </header>
    );
}