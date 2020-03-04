import React from 'react';
import styles from './Search.module.css';
import { MdSearch } from 'react-icons/md'

const Search = props => {
  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <input
          className={styles.input}
          type="text"
          placeholder="Filter by project"
          onChange={props.onSearch}
        />
        <MdSearch className={styles.icon} />
      </div>
    </div>
  );
};

export default Search;
