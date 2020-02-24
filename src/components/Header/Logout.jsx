import React from 'react';
import styles from './Logout.module.css';
import Routes from '../../utils/routes';
import HeaderControl from './HeaderControl';

const Logout = () => {
  return (
    <HeaderControl className={styles.container} link={Routes.Logout}>
      Logout
    </HeaderControl>
  );
};

export default Logout;
