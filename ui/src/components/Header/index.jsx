import React from 'react';
import styles from './index.module.css';
import defaultLogo from '../../static/images/logo.png';
import Routes from '../../utils/routes';
import SuperUserLink from './SuperUserLink';
import UserMenu from './UserMenu';
import { isSuperUser } from '../../store';
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive/src";
import Button from "../common/Button";
import { CloseMenu, OpenMenu } from "../Icons";

const Header = props => {
  const { authUser, localUser, isSocialLogin, logo, slogan, onSidemenuTrigger, showSidebar, showTabletSidebar } = props;
  const userInStore = useSelector(state => state.authReducer.user);
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1337 })

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
          {isTablet && showSidebar !== false && <Button className={styles.hambugerIcon} onClick={onSidemenuTrigger}>
              {showTabletSidebar ? <CloseMenu /> : <OpenMenu /> }
          </Button>}
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
        <UserMenu authUser={authUser} localUser={userInStore} isSocialLogin={isSocialLogin} />
      </div>
    </div>
  );
};

export default Header;
