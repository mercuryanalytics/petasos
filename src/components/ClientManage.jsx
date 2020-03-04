import React from 'react';
import styles from './ClientManage.module.css';

const ClientManage = props => {
  return (
    <div className={styles.container}>
      [ClientManage-{props.id}]
    </div>
  );
};

export default ClientManage;
