import React from 'react';
import styles from './index.module.css';
import Search from './Search';
import Domain from './Domain';

const SideMenu = () => {
  return (
    <div className={styles.container}>
      <Search />
      <Domain open={true} />
      <Domain />
    </div>
  );
};

export default SideMenu;
