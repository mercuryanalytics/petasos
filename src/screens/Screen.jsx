import React, { useState } from 'react';
import styles from './Screen.module.css';
import history from '../utils/history';
import Routes from '../utils/routes';
import { useAuth0 } from '../react-auth0-spa';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Loader from '../components/Loader';

const Screen = props => {
  const { loading, isAuthenticated, user, getIdTokenClaims } = useAuth0();
  const [authKey, setAuthKey] = useState();

  const render = () => !props.blank ? (
    <div className={styles.container}>
      <div className={styles.head}>
        <Header user={user} />
      </div>
      <div className={styles.body}>
        <div className={styles.side}>
          <SideMenu />
        </div>
        <div className={styles.content}>
          {props.children}
        </div>
      </div>
    </div>
  ) : (
    <>{props.children}</>
  );

  if (props.private) {
    if (!loading) {
      if (isAuthenticated) {
        getIdTokenClaims().then(res => {
          setAuthKey(res.__raw);
          if (props.onLogin) {
            props.onLogin({ user: user, authKey: res.__raw });
          }
        });
        return render();
      }
      return <Redirect to={`${Routes.Login}#${history.location.pathname}`} />;
    }
    return <Loader />;
  }
  return render();
};

export default Screen;
