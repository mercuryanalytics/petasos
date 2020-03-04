import React from 'react';
import styles from './PageNotFound.module.css';
import Routes from '../utils/routes';
import Screen from './Screen';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <Screen blank>
      <div className={styles.container}>
        <span className={styles.info}>Page not found!</span>
        <Link className={styles.link} to={Routes.Home}>Go Home</Link>
      </div>
    </Screen>
  );
};

export default PageNotFound;
