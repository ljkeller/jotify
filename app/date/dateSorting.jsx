import Link from 'next/link';
import styles from '/styles/DateSorting.module.css';

export default function DateSorting({ date, serverSortConfig }) {
  const sortButtonPresets = new Map([['Last Name', { sort: 'name', direction: 'asc' }], ['Most Recent', { sort: 'date', direction: 'desc' }], ['Bond amount', { sort: 'bond', direction: 'desc' }], ['Age', { sort: 'age', direction: 'asc' }]]);
  const sortingButtons = Array.from(sortButtonPresets.entries()).map(([name, conf], idx) => {
    const color = conf.sort === serverSortConfig.option ? styles.active : styles.inactive;
    return <Link key={idx} prefetch={false} className={`${styles.sortingLink} ${color}`} href={`/date?date=${date}&sort=${conf.sort}&direction=${conf.direction}`}>{name}</Link>
  }
  );

  return <div className={styles.filters}>
    {sortingButtons}
  </div >
}