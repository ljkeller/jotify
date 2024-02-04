'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { RiUserSearchFill } from "react-icons/ri";
import { FaMask } from 'react-icons/fa';

import styles from '../../styles/Search.module.css';

export default function SearchBar() {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchText)}`);
  };

  return <div className={`${styles.searchContainer} `}>
    <form
      onSubmit={handleSearch}
      className={styles.searchOptionsContainer}>
      <FaMask className={`${styles.searchIcon} ${styles.complementary}`} />
      <div className={`${isFocused || searchText ? styles.searchFocused : styles.search}`}>
        <RiUserSearchFill className={styles.searchIcon} />
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search by name..."
        />
        {isFocused || searchText ?
          (<div className={styles.floater}>
            <p>John Smith</p>
            <p>Jane Doe</p>
            <p>Lor Knows</p>
          </div>)
          : null
        }
      </div>
    </form>


  </div>
}