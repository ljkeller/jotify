'use client';
import styles from "../../styles/Home.module.css";
import React, {useState, useEffect} from 'react';
import CompressedRecord from '/app/ui/compressedRecord';

export default function CompressedRecordStreamer() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch(`/api/records?page=${page}`);
      const newRecords = await resp.json();

      setRecords(prevItems => [...prevItems, ...newRecords]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // trigger fetch on initial render
  useEffect(() => {
    fetchRecords();
  }, []);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop
        !==document.documentElement.offsetHeight
        || isLoading) {
      return;
    }
    fetchRecords();
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);
  
  // TODO: improve loading animation
  // TODO: add logic to handle large amounts of records
  return (
  <div className={styles.records}>
    {records.map((record, idx) => (<CompressedRecord key={idx} data={record} />))}
    {isLoading && <div>Loading...</div>}
    {error && <div>Error: {error.message}</div>}
  </div>
  );

}