import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Account.module.css';
import { setLocationData } from '../store/location/actions';
import { getUsers } from '../store/users/actions';
import Screen from './Screen';
import Breadcrumbs from '../components/Breadcrumbs';
import UserManage from '../components/UserManage';

const Account = () => {
  const dispatch = useDispatch();
  const activeUser = useSelector(state => state.authReducer.user);
  const user = useSelector(state =>
    activeUser ? state.usersReducer.users.filter(u => u.email === activeUser.email)[0] : null);

  useEffect(() => {
    if (activeUser && !user) {
      dispatch(setLocationData({ account: activeUser.email }));
      dispatch(getUsers());
    }
  }, [activeUser, user]);

  return (
    <Screen className={styles.container} private>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs data={['My account'].concat(user ? [user.email] : [])} />
      </div>
      <div className={styles.content}>
        <UserManage id={user ? user.id : null} />
      </div>
    </Screen>
  );
};

export default Account;
