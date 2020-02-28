import React from 'react';
import styles from './PageNotFound.module.css';
import Screen from './Screen';

const PageNotFound = () => {
  return (
    <Screen blank>
      <div className={styles.container}>
        <span className={styles.info}>Page not found!</span>
        <a className={styles.move} href="/">Go Home</a>
      </div>
    </Screen>
  );
};

export default PageNotFound;
