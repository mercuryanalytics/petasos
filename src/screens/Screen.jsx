import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Screen.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import { setUser, setAuthKey } from '../store/auth/actions';
import { getUsers } from '../store/users/actions';
import { useAuth0 } from '../react-auth0-spa';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Loader from '../components/Loader';

const Screen = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { loading, isAuthenticated, user, getIdTokenClaims } = useAuth0();
  const activeUser = useSelector(state => state.authReducer.user);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      if (props.onLoad) {
        props.onLoad();
      }
      setReady(true);
    } else {
      setReady(false);
    }
  }, [loaded]);

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user]);

  if (props.private) {
    if (!loading && !loaded) {
      if (isAuthenticated) {
        getIdTokenClaims().then(res => {
          dispatch(setAuthKey(res.__raw));
          dispatch(getUsers()).then(() => setLoaded(true));
        });
      } else {
        return <Redirect to={`${Routes.Login}#${history.location.pathname}`} />;
      }
    }
  } else if (!loaded) {
    setLoaded(true);
  }

  return ready && !props.keepLoading ? (
    !props.blank ? (
      <div className={`${styles.container} ${props.className || ''}`}>
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
