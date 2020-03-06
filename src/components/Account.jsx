import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './Account.module.css';
import { setLocationData } from '../store/location/actions';

const Account = props => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLocationData({ account: props.id }));
  }, [props.id]);

  return (
    <div className={styles.container}>
      [Account]
    </div>
  );
};

export default Account;
