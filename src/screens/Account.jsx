import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Account.module.css';
import { setLocationData } from '../store/location/actions';
import Screen from './Screen';

const Account = () => {
  const dispatch = useDispatch();
  const activeUser = useSelector(state => state.authReducer.user);

  useEffect(() => {
    if (activeUser) {
      dispatch(setLocationData({ account: activeUser.email }));
    }
  }, [activeUser]);

  return (
    <Screen private>
      <div className={styles.container}>
        [Account]
      </div>
    </Screen>
  );
};

export default Account;
