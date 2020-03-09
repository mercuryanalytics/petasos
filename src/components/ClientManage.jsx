import React, { useState } from 'react';
import styles from './ClientManage.module.css';
import UserPermissions from './UserPermissions';
import Button from './Button';
import { MdInfoOutline, MdSupervisorAccount } from 'react-icons/md';
import Form, { Input, Textarea } from './Form';

const ClientManage = props => {
  const { data } = props;

  return (
    <div className={styles.container}>
      [ClientManage]
    </div>
  );
};

export default ClientManage;
