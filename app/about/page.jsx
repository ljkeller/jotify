import styles from '/styles/About.module.css';

export const metadata = {
  title: 'About scjail.io',
  description: 'About scjail.io'
}

export default function About() {
  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.about}`}>
        <h2 className={styles.header}>About <span className={styles.complementary}>sc</span>jail.io</h2>
        <p className={styles.aboutText}>I hope you can use this website to <strong>find what you need faster, and share that information easier.</strong></p>
        <p className={styles.aboutText}>This website is all about a <strong>modernized user experience</strong> for accessing inmate records for Scott County, Iowa.
          Ever found it frustrating that inmate data is deleted after 7 days? Frustrated with clunky, slow, or outdated websites?
          Maybe, you want to quickly find records relating to the one you're looking at.
        </p>
        <p className={styles.aboutText}>scjail.io is a modern, fast, and easy-to-use website that aims to serve the people around Scott County, Iowa.</p>
        <p className={styles.aboutText}>There is <strong>no money collecting, no donating, no ads</strong>. This is a public service that took considerable time to develop.</p>
      </div >
    </div>

  );
}