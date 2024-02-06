'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

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
  const [isAliasSearch, setIsAliasSearch] = useState(false);
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchText)}`);
  };

  const debouncedQuery = useDebouncedCallback((query) => {
    fetchQuerySuggestions(query).then((suggestions) => { setSuggestions(suggestions) });
  }, 150);

  useEffect(() => {
    debouncedQuery(searchText);
  }, [searchText]);

  return <div className={`${styles.searchContainer} `}>
    <form
      onSubmit={handleSearch}
      className={styles.searchOptionsContainer}>
      <FaMask onClick={() => setIsAliasSearch(!isAliasSearch)} className={`${isAliasSearch ? styles.aliasSearchActive : styles.aliasSearchInactive}`} />
      <div className={`${isFocused || searchText ? styles.searchFocused : styles.search} ${isAliasSearch ? styles.aliasSearchAura : styles.nameSearchAura}`}>
        <RiUserSearchFill className={styles.searchIcon} />
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Search by ${isAliasSearch ? 'alias' : 'name'}`}
        />
        {suggestions?.length ?
          (<div className={styles.floater}>
            {[... new Set(suggestions)].slice(0, 10).map((suggestion, idx) => <a href={`/search?query=${encodeURIComponent(suggestion)}`} key={idx} className={styles.suggestion}>{suggestion}</a>)}
          </div>)
          : null
        }
      </div>
    </form>


  </div>
}