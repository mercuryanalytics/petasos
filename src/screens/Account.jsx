import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styles from './Account.module.css';
import { setLocationData } from '../store/location/actions';
import Screen from './Screen';
import Breadcrumbs from '../components/Breadcrumbs';
import UserManage from '../components/UserManage';

const Account = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);

  const handleScreenLoad = useCallback((user) => {
    setUser(user);
    dispatch(setLocationData({ account: user.email }));
  });

  return (
    <Screen className={styles.container} private onLoad={handleScreenLoad}>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs data={['My account'].concat(user ? [user.email] : [])} />
      </div>
      <div className={styles.content}>
        <UserManage id={user ? user.id : null} preview={true} />
      </div>
    </Screen>
  );
};

export default Account;
