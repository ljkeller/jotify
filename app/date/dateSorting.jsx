'use client';

import styles from '/styles/DateSorting.module.css';

const handleFilterClick = (filterType) => {
  console.log(filterType);
}

export default function DateSorting() {
  return <div className={styles.filters}>
    <button className={styles.inactiveFilter} onClick={() => handleFilterClick('name')}>Name</button>
    <button className={styles.activeFilter} onClick={() => handleFilterClick('bookingDate')}>Booking Date</button>
    <button className={styles.inactiveFilter} onClick={() => handleFilterClick('bond')}>Bond $</button>
    <button className={styles.inactiveFilter} onClick={() => handleFilterClick('age')}>Age</button>
  </div>
}