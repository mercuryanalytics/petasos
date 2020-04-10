import React from 'react';
import styles from './ClientAdd.module.css';
import Button from '../Button';
import Routes from '../../utils/routes';

const ClientAdd = () => {
  return (
    <Button className={styles.container} link={Routes.CreateClient} action={true}>
      + Create new client
    </Button>
  );
};

export default ClientAdd;
