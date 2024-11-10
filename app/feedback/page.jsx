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
        <p className={styles.feedbackText}>Feel free to send in feedback and/or feature requests. Or, if you're interested in helping, let me know!</p>
        <p className={styles.feedbackText}>Note:</p>
        <ul>
          <li className={styles.feedbackText}>ignore the text in <span className={styles.filterColor}>this color</span></li>
          <li className={styles.feedbackText}>update the text in <span className={styles.replaceMe}>this color</span></li>
          <li className={styles.feedbackText}>remove spaces</li>
          <li className={styles.feedbackText}>include 'scjail.io' in email subject</li>
        </ul>
        <div className={styles.inbox}>
          <p className={styles.reverseMe}>drallip</p>
          <p className={styles.filterColor}>scott county</p>
          <p>.lucas</p>
          <p className={`${styles.replaceMe} ${styles.padMe}`}>at</p>
          <p className={styles.filterColor}>gmail</p>
          <p className={`${styles.reverseMe}`}>oohay</p>
          <p className={`${styles.replaceMe} ${styles.padMe}`}>dot</p>
          <p>com</p>
        </div>
        <h3 className={styles.footer}>Thank you!</h3>
      </div>
    </div >
  );
}
