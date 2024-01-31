import '/app/ui/global.css';
import { m_plus_2 } from '/app/ui/fonts';
import styles from '/styles/Disclaimer.module.css';

export const metadata = {
  title: 'scjail.io disclaimer',
  description: 'Innocent until proven guilty',
}

export default function Disclaimer() {
  return (
    <div className={`${m_plus_2.className} ${styles.container}`}>
      <h2 className={styles.header}>Disclaimer</h2>
      <div className={`${styles.disclaimer}`}>
        <p className={styles.disclaimerText}><strong>All data and information provided on this site is for informational purposes only. </strong>
          scjail.io makes no representations as to accuracy, completeness, currentness, suitability, or validity of any information on this site and will not be liable for any errors, omissions, or delays in this information or any losses, injuries, or damages arising from its display or use.
        </p>
        <p className={styles.disclaimerText}>
          Due to the possibility of unauthorized modification of electronic data, errors in transmission, browser incompatibilities, and other aspects of electronic communication that are beyond our control, information contained in the scjail.io website should not be considered suitable for legal purposes.
          Additionally, information has often have been updated since the last modification of the site.
        </p>

        <p className={styles.disclaimerText}>This site aims to serve the people of Scott County, Iowa.</p>

        <p className={styles.disclaimerText}><b>Remember: innocent until proven guilty.</b></p>
      </div >
    </div >

  );
}