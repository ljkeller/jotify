import styles from '/styles/Feedback.module.css';

export const metadata = {
    title: 'scjail.io feedback',
    description: 'Thank you for your feedback!',
}

export default function Feedback() {
    return (
        <div className={styles.container}>
            <div className={styles.feedback}>
                <h2 className={styles.header}>Have feedback or feature requests?</h2>
                <p>Feel free to send in feedback and/or feature requests. Or, if you're interested in helping, let me know!</p>
                <p>Note:</p>
                <ul>
                    <li>ignore the text in <span className={styles.filterColor}>this color</span></li>
                    <li>update the text in <span className={styles.replaceMe}>this color</span></li>
                    <li>remove spaces</li>
                </ul>
                <div className={styles.inbox}>
                    <p className={styles.reverseMe}>cs</p>
                    <p className={styles.filterColor}>scott county</p>
                    <p>jail</p>
                    <p className={`${styles.replaceMe} ${styles.padMe}`}>at</p>
                    <p className={styles.filterColor}>yahoo</p>
                    <p className={`${styles.reverseMe}`}>liamg</p>
                    <p className={`${styles.replaceMe} ${styles.padMe}`}>dot</p>
                    <p>com</p>
                </div>
                <h3 className={styles.header}>Thank you!</h3>
            </div>
        </div >
    );
}