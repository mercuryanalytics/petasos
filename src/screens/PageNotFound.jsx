import React from 'react';
import styles from './PageNotFound.module.css';

const PageNotFound = () => {
  return (
    <div className={styles.container}>
      <span className={styles.info}>Page not found!</span>
      <a className={styles.move} href="/">Go Home</a>
    </div>
  );
};

export default PageNotFound;
