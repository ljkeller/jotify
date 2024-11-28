'use client';

import { LuShare } from "react-icons/lu";

import styles from '/styles/Share.module.css';

const handleShare = async (link) => {
  const shareLink = link ? link : window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'scjail.io',
        url: shareLink
      });
    } catch (err) {
      console.log("Error sharing: " + err);
    }
  } else {
    navigator.clipboard.writeText(shareLink);
  }
};

export default function Share({ link }) {
  return <span className={styles.share} onClick={() => handleShare(link)}><LuShare /> Share</span>;
}
