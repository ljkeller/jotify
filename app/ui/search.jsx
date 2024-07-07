'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { RiUserSearchFill } from "react-icons/ri";
import { MdPersonSearch } from "react-icons/md";
import { FaMask } from 'react-icons/fa';

import styles from '../../styles/Search.module.css';

const searchRoute = '/search?query=';
const aliasRoute = '/alias?query=';

// TODO: fix search such that 'john doe' works
async function fetchQuerySuggestions(searchText, isAliasSearch = false) {
  console.log(`Fetching query suggestions for: ${searchText}`);
  if (!searchText || searchText.length < 3) {
    return [];
  }

  const response = await fetch(`/api/search?type=${isAliasSearch ? 'alias' : 'name'}&query=${encodeURIComponent(searchText)}`);
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
    router.push(`${isAliasSearch ? aliasRoute : searchRoute}${encodeURIComponent(searchText)}`);
  };

  const debouncedQuery = useDebouncedCallback((query) => {
    fetchQuerySuggestions(query, isAliasSearch).then((suggestions) => { setSuggestions(suggestions) });
  }, 150);

  useEffect(() => {
    debouncedQuery(searchText);
  }, [searchText]);

  return <div className={`${styles.searchContainer} `}>
    <form
      onSubmit={handleSearch}
      className={styles.searchOptionsContainer}>
      {
        isAliasSearch ?
          <MdPersonSearch
            onClick={() => {
              const isAliasSearchSnapshot = isAliasSearch;
              setIsAliasSearch(!isAliasSearchSnapshot);
              fetchQuerySuggestions(searchText, !isAliasSearchSnapshot).then((suggestions) => { setSuggestions(suggestions) });
            }}
            className={styles.nameSearchIcon}
            title="Search by name"
          />
          :
          <FaMask
            onClick={() => {
              const isAliasSearchSnapshot = isAliasSearch;
              setIsAliasSearch(!isAliasSearchSnapshot);
              fetchQuerySuggestions(searchText, !isAliasSearchSnapshot).then((suggestions) => { setSuggestions(suggestions) });
            }}
            className={styles.aliasSearchIcon}
            title="Search by alias"
          />
      }
      <div className={`${isFocused || searchText ? `${styles.searchFocused} ${isAliasSearch ? styles.aliasHighlight : styles.nameHighlight}` : styles.search} ${isAliasSearch ? styles.aliasSearchAura : styles.nameSearchAura} `}>
        <RiUserSearchFill className={styles.searchIcon} />
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onMouseEnter={() => setIsFocused(true)}
          onMouseLeave={() => setIsFocused(false)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(event) => {
            // clear search text (and drop hoverbox) on escape
            if (event.key === 'Escape') {
              setSearchText("")
            }
          }}
          placeholder={`Search by ${isAliasSearch ? 'alias' : 'name'} `}
        />
        {suggestions?.length ?
          (<div className={`${styles.floater} ${isAliasSearch ? styles.aliasFloater : styles.nameFloater}`}>
            {[... new Set(suggestions)]
              .slice(0, 10).map((suggestion, idx) =>
                <a href={`${isAliasSearch ? 'alias' : 'search'}?query=${encodeURIComponent(suggestion)}`}
                  key={idx}
                  className={`${styles.suggestion} ${isAliasSearch ? styles.complementary : styles.primary}`}>{suggestion}
                </a>)}
          </div>)
          : null
        }
      </div>
    </form>
  </div>
}
