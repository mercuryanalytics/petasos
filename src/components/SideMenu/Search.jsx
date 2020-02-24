import React from 'react';
import styles from './Search.module.css';

const Search = () => {
  const handleChange = (event) => {
    console.log('--search-change', event);
  };
  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text"
        placeholder="Filter by project"
        onChange={handleChange}
      />
    </div>
  );
};

export default Search;
