import React from 'react';
import styles from './index.module.css';
import logo from '../../static/images/logo.png';
import Routes from '../../utils/routes';
import SuperUserLink from './SuperUserLink';
import UserMenu from './UserMenu';
import { isSuperUser } from '../../store';

const Header = props => {
  const { authUser, localUser } = props;
  return (
    <div className={styles.container}>
      <a className={styles.link} href={Routes.Home}>
        <img src={logo} alt='' className={styles.logo} />
      </a>
      <div className={styles.controls}>
        {isSuperUser(localUser.id) && <SuperUserLink />}
        <UserMenu authUser={authUser} localUser={localUser} />
      </div>
    </div>
  );
};

export default Header;
