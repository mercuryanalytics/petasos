import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styles from './Screen.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import { setUser, setAuthKey } from '../store/auth/actions';
import { getUsers, getUserAuthorizations } from '../store/users/actions';
import { useAuth0 } from '../react-auth0-spa';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Loader from '../components/Loader';

const Screen = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { loading, isAuthenticated, user, getIdTokenClaims } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [doRedirect, setDoRedirect] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!props.private) {
      setIsLoading(false);
    } else {
      if (isAuthenticated) {
        let authUserEmail;
        getIdTokenClaims().then(async (res) => {
          authUserEmail = res.email;
          setAuthUser(res);
          await dispatch(setAuthKey(res.__raw));
        }).then(() => {
          dispatch(getUsers()).then(action => {
            const users = Array.isArray(action.payload) ? action.payload : [];
            const user = users.filter(u => u.email === authUserEmail)[0];
            if (user) {
              setLocalUser(user);
              dispatch(setUser(user));
              dispatch(getUserAuthorizations(user.id)).then((r) => {
                setIsLoading(false);
              });
            } else {
              // @TODO Global error
            }
          });
        });
      } else {
        setDoRedirect(true);
      }
    }
  }, [props.private, isAuthenticated, loading]);

  const handleOnLoad = useCallback(() => {
    if (props.onLoad) {
      props.onLoad(localUser, authUser);
    }
  }, [localUser, authUser, props.onLoad]);

  useEffect(() => {
    if (!isLoading) {
      handleOnLoad();
    }
  }, [isLoading]);

  if (doRedirect) {
    return <Redirect to={`${Routes.Login}#${history.location.pathname}`} />;
  }

  return !isLoading && !props.keepLoading ? (
    !props.blank ? (
      <div className={`${styles.container} ${props.className || ''}`}>
        <div className={styles.head}>
          <Header authUser={authUser} localUser={localUser} />
        </div>
        <div className={styles.body}>
          {props.showSideBar !== false && (
            <div className={styles.side}>
              <SideMenu />
            </div>
          )}
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
