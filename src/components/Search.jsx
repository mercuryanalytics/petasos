import React from 'react';
import styles from './Search.module.css';
import { MdSearch } from 'react-icons/md'

const Search = props => {
  const onSearch = (event) => {
    if (props.onSearch) {
      props.onSearch(event.target.value);
    }
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text"
        placeholder={props.placeholder}
        onChange={onSearch}
      />
      <MdSearch className={styles.icon} />
    </div>
  );
};

export default Search;
