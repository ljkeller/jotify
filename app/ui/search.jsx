'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { RiUserSearchFill } from "react-icons/ri";
import { FaMask } from 'react-icons/fa';

import styles from '../../styles/Search.module.css';

async function fetchQuerySuggestions(searchText) {
  console.log(`Fetching query suggestions for: ${searchText}`);
  if (!searchText || searchText.length < 3) {
    return [];
  }

  const response = await fetch('/api/search?query=' + encodeURIComponent(searchText));
  const suggestions = await response.json();
  console.log(suggestions);
  return response.ok ? suggestions : [];
}

export default function SearchBar() {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchText)}`);
  };

  useEffect(() => {
    fetchQuerySuggestions(searchText).then((suggestions) => { setSuggestions(suggestions) });
  }, [searchText]);

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
        {isFocused && suggestions?.length ?
          (<div className={styles.floater}>
            {suggestions.map((suggestion, idx) => <a href={`/search?query=${encodeURIComponent(suggestion)}`} key={idx} className={styles.suggestion}>{suggestion}</a>)}
          </div>)
          : null
        }
      </div>
    </form>


  </div>
}