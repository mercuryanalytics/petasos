import React from 'react';
import styles from './index.module.css';
import logo from '../../static/images/logo.png';
import UserMenu from './UserMenu';
import Logout from './Logout';

const Header = () => {
  return (
    <div className={styles.container}>
      <img src={logo} className={styles.logo} />
      <div className={styles.controls}>
        <UserMenu />
        <Logout />
      </div>
    </div>
  );
};

export default Header;
