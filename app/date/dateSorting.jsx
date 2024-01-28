import Link from 'next/link';
import { ImSortAlphaAsc } from "react-icons/im";
import { ImSortAlphaDesc } from "react-icons/im";
import { BsSortDownAlt } from "react-icons/bs";
import { BsSortDown } from "react-icons/bs";
import { ImSortNumericAsc } from "react-icons/im";
import { ImSortNumbericDesc } from "react-icons/im";
import { BsSortUpAlt } from "react-icons/bs";

import styles from '/styles/DateSorting.module.css';

export default function DateSorting({ date }) {
  return <div className={styles.filters}>
    <div className={styles.textIconsBundle}>
      Name
      <div className={styles.upperLowerIcons}>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=name&direction=asc`}><ImSortAlphaAsc /></Link>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=name&direction=desc`}><ImSortAlphaDesc /></Link >
      </div>
    </div>
    <div className={styles.textIconsBundle}>
      Recency
      <div className={styles.upperLowerIcons}>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=date&direction=asc`}><BsSortDownAlt /></Link>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=date&direction=desc`}><BsSortDown /></Link >
      </div>
    </div>
    <div className={styles.textIconsBundle}>
      Bond
      <div className={styles.upperLowerIcons}>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=bond&direction=asc`}><ImSortNumericAsc /></Link>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=bond&direction=desc`}><ImSortNumbericDesc /></Link >
      </div>
    </div>
    <div className={styles.textIconsBundle}>
      Age
      <div className={styles.upperLowerIcons}>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=age&direction=asc`}><ImSortNumericAsc /></Link>
        <Link className={styles.inactiveFilter} href={`/date?date=${date}&sort=age&direction=desc`}><ImSortNumbericDesc /></Link >
      </div>
    </div>
  </div >
}