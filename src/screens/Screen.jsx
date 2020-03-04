import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Screen.module.css';
import history from '../utils/history';
import Routes from '../utils/routes';
import { setUser, setAuthKey } from '../store/auth/actions';
import { useAuth0 } from '../react-auth0-spa';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Loader from '../components/Loader';

const Screen = props => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated, user, getIdTokenClaims } = useAuth0();
  const activeUser = useSelector(state => state.authReducer.user);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded && props.onLoad) {
      props.onLoad();
    }
  }, [loaded]);

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user]);

  if (props.private) {
    if (!loading) {
      if (isAuthenticated) {
        getIdTokenClaims().then(res => {
          dispatch(setAuthKey(res.__raw));
          setLoaded(true);
        });
      } else {
        return <Redirect to={`${Routes.Login}#${history.location.pathname}`} />;
      }
    }
  } else if (!loaded) {
    setLoaded(true);
  }

  return loaded ? (
    !props.blank ? (
      <div className={styles.container}>
        <div className={styles.head}>
          <Header user={activeUser} />
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
    )
  ) : (
    <Loader />
  );
};

export default Screen;
