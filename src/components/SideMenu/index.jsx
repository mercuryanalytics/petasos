import React from 'react';
import styles from './index.module.css';
import Search from './Search';
import Domain from './Domain';
import DomainAdd from './DomainAdd';

const SideMenu = () => {
  return (
    <div className={styles.container}>
      <Search />
      <Domain open={true} />
      <Domain />
      <div className={styles.add}>
        <DomainAdd />
      </div>
    </div>
  );
};

export default SideMenu;
