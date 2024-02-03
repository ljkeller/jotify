'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { RiUserSearchFill } from "react-icons/ri";
import { FaMask } from 'react-icons/fa';

import styles from '../../styles/Search.module.css';

export default function SearchBar() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchText)}}`);
  };

  return <form
    onSubmit={handleSearch}
    className={styles.searchOptionsContainer}>
    <FaMask className={`${styles.searchIcon} ${styles.complementary}`} />
    <div className={styles.search}>
      <RiUserSearchFill className={styles.searchIcon} />
      <input
        type="text"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Search by name..."
      />
    </div>
  </form>
}