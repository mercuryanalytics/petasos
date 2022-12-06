import React from 'react';
import styles from './ClientAdd.module.css';
import Button from '../common/Button';
import Routes from '../../utils/routes';

const ClientAdd = () => {
  return (
    <Button className={styles.container} to={Routes.CreateClient} action={true} transparent>
      + Create new client
    </Button>
  );
};

export default ClientAdd;
