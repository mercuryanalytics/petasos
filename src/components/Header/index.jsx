import React from 'react';
import styles from './index.module.css';
import defaultLogo from '../../static/images/logo.png';
import Routes from '../../utils/routes';
import SuperUserLink from './SuperUserLink';
import UserMenu from './UserMenu';
import { isSuperUser } from '../../store';

const Header = props => {
  const { authUser, localUser, isSocialLogin, logo, slogan } = props;

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <a
          className={styles.link}
          href={Routes.Home}
          title={`Reports Access Manager\n${process.env.REACT_APP_VERSION}`}
        >
          <img src={logo || defaultLogo} alt='' className={styles.logo} />
        </a>
        {!!slogan && <span className={styles.slogan}>{slogan}</span>}
      </div>
      <div className={styles.controls}>
        {isSuperUser(localUser.id) && <SuperUserLink />}
        <UserMenu authUser={authUser} localUser={localUser} isSocialLogin={isSocialLogin} />
      </div>
    </div>
  );
};

export default Header;
