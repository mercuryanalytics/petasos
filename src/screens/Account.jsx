import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styles from './Account.module.css';
import { setLocationData } from '../store/location/actions';
import Screen from './Screen';
import Breadcrumbs from '../components/common/Breadcrumbs';
import UserManage from '../components/UserManage';
import { useMediaQuery } from "react-responsive/src";

const Account = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const handleScreenLoad = useCallback((user) => {
    setUser(user);
    dispatch(setLocationData({ account: user.email }));
  }, [dispatch]);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', 'alignItems': 'center', 'margin': '50px', 'justifyContent': 'center' }}>
        <h2>Our Workbench, Research Results Website and other Tools are optimized for access on Desktop, Laptop and Tablet.</h2>
      </div>
    );
  }

  return (
    <Screen className={styles.container} private independent onLoad={handleScreenLoad}>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs data={['My account'].concat(user ? [user.email] : [])} />
      </div>
      <div className={styles.content}>
        <UserManage id={user ? user.id : null} preview={true} canEdit={true} disableAccountChange={true} />
      </div>
    </Screen>
  );
};

export default Account;
