import React from 'react';
import { useSelector } from 'react-redux';
import styles from './SuperUserLink.module.css';
import Routes from '../../utils/routes';
import HeaderControl from './HeaderControl';
import { SuperUser, ArrowBack } from '../Icons';

const SuperUserLink = () => {
  const inSuperUserMode = useSelector(state => state.locationReducer.data.superUser);

  return (
    <HeaderControl className={styles.container} link={inSuperUserMode ? Routes.Home : Routes.SuperUser}>
      {!inSuperUserMode ? (
        <>
          <SuperUser className={styles.icon} />
          <span className={styles.text}>Super admin</span>
        </>
      ) : (
        <>
          <ArrowBack className={styles.icon} />
          <span className={styles.text}>Go back to Home</span>
        </>
      )}
    </HeaderControl>
  );
};

export default SuperUserLink;
