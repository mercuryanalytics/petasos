import React from 'react';
import styles from './Search.module.css';
import { MdSearch } from 'react-icons/md'

const Search = props => {
  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text"
        placeholder={props.placeholder}
        onChange={props.onSearch}
      />
      <MdSearch className={styles.icon} />
    </div>
  );
};

export default Search;
