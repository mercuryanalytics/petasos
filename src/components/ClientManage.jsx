import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ClientManage.module.css';
import { setLocationData } from '../store/location/actions';
import { getClient } from '../store/clients/actions';

const ClientManage = props => {
  const dispatch = useDispatch();
  const client = useSelector(state =>
    state.clientsReducer.clients.filter(c => c.id === props.id));

  useEffect(() => {
    dispatch(setLocationData({ client: props.id }));
    if (!client || props.id !== client.id) {
      dispatch(getClient(props.id));
    }
  }, [props.id]);

  return (
    <div className={styles.container}>
      [ClientManage-{props.id}]
    </div>
  );
};

export default ClientManage;
