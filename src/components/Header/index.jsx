import React from 'react';
import styles from './index.module.css';
import logo from '../../static/images/logo.png';
import UserMenu from './UserMenu';

const Header = props => {
  return (
    <div className={styles.container}>
      <img src={logo} alt='' className={styles.logo} />
      <div className={styles.controls}>
        <UserMenu user={props.user} />
      </div>
    </div>
  );
};

export default Header;
