import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Account.module.css';
import { setLocationData } from '../store/location/actions';
import { getUsers } from '../store/users/actions';
import Screen from './Screen';
import Loader from '../components/Loader';
import Breadcrumbs from '../components/Breadcrumbs';
import UserManage from '../components/UserManage';

const Account = () => {
  const dispatch = useDispatch();
  const activeUser = useSelector(state => state.authReducer.user);
  const user = useSelector(state =>
    activeUser ? state.usersReducer.users.filter(u => u.email === activeUser.email)[0] : null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (activeUser) {
      dispatch(setLocationData({ account: activeUser.email }));
      dispatch(getUsers());
    }
  }, [activeUser]);

  return (
    <Screen className={styles.container} private onLoad={() => setReady(true)}>
      <div className={styles.header}>
        <Breadcrumbs data={['My account']} />
      </div>
      {ready && user ? (
        <UserManage data={user} />
      ) : (
        <Loader inline className={styles.loader} />
      )}
    </Screen>
  );
};

export default Account;
