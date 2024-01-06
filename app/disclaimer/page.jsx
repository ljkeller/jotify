import '/app/ui/global.css';
import { m_plus_2 } from '/app/ui/fonts';
import styles from '/styles/Disclaimer.module.css';


export default function Disclaimer() {
    return (
        <div className={`${m_plus_2.className} ${styles.container}`}>
            <div className={`${styles.disclaimer}`}>
                <h2 className={styles.header}>Disclaimer:</h2>
                <p>All data and information provided on this site is for informational purposes only.
                    jotify.io makes no representations as to accuracy, completeness, currentness, suitability, or validity of any information on this site and will not be liable for any errors, omissions, or delays in this information or any losses, injuries, or damages arising from its display or use.

                    Due to the possibility of unauthorized modification of electronic data, errors in transmission, browser incompatibilities, and other aspects of electronic communication that are beyond our control, information contained in the jotify website should not be considered suitable for legal purposes.

                    Information may have been updated since the last modification of the site.
                </p>

                <p>This site aims to serve the people of the Quad Cities.</p>

                <b>Remember: innocent until proven guilty.</b>
            </div >
        </div>

    );
}