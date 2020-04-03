import React from 'react';
import styles from './AccessRestricted.module.css';
import Routes from '../utils/routes';
import Screen from './Screen';
import { NavLink } from 'react-router-dom';

const AccessRestricted = () => {
  return (
    <Screen blank>
      <div className={styles.container}>
        <span className={styles.info}>Access to this location is restricted.</span>
        <a className={styles.link} href={Routes.Home}>Go Home</a>
      </div>
    </Screen>
  );
};

export default AccessRestricted;
