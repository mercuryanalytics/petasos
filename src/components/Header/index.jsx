import React from 'react';
import styles from './index.module.css';
import logo from '../../static/images/logo.png';
import Routes from '../../utils/routes';
import SuperUserLink from './SuperUserLink';
import UserMenu from './UserMenu';

const Header = props => {
  return (
    <div className={styles.container}>
      <a className={styles.link} href={Routes.Home}>
        <img src={logo} alt='' className={styles.logo} />
      </a>
      <div className={styles.controls}>
        <SuperUserLink />
        <UserMenu user={props.user} />
      </div>
    </div>
  );
};

export default Header;
