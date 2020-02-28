import React from 'react';
import styles from './DomainAdd.module.css';
import Button from '../Button';
import Routes from '../../utils/routes';

const DomainAdd = () => {
  return (
    <Button className={styles.container} link={Routes.CreateDomain}>
      + Create new domain
    </Button>
  );
};

export default DomainAdd;
