import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Screen.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import { isLoggedIn, auth0StorageKey, auth0ErrorMessageKey } from '../components/Auth';
import { setLocationData } from '../store/location/actions';
import { setUser } from '../store/auth/actions';
import { getUsers, getMyAuthorizations } from '../store/users/actions';
import { getClients } from '../store/clients/actions';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Loader from '../components/common/Loader';
import { EmptyState } from '../components/Icons';
import { isSuperUser } from '../store';

const Screen = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isSideMenuLoading, setIsSideMenuLoading] = useState(true);
  const authUser = useSelector(state => state.authReducer.authUser);
  const isSocialLogin = useSelector(state => state.authReducer.isSocialLogin);
  const partner = useSelector(state => state.authReducer.partner);
  const partnerClient = useSelector(state => !partner ? null :
    (state.clientsReducer.clients.filter(c => c.subdomain === partner)[0] || null));
  const [customLogo, setCustomLogo] = useState(null);
  const [customSlogan, setCustomSlogan] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [doRedirect, setDoRedirect] = useState(false);
  const [realEmptyState, setRealEmptyState] = useState(false);
  const [emptyState, setEmptyState] = useState(false);

  useEffect(() => {
    if (partner && authUser) {
      dispatch(getClients()).then(() => {}, () => {});
    }
  // eslint-disable-next-line
  }, [partner, authUser]);

  useEffect(() => {
    if (partnerClient) {
      partnerClient.logo_url && setCustomLogo(partnerClient.logo_url);
      partnerClient.slogan && setCustomSlogan(partnerClient.slogan);
    }
  }, [partnerClient]);

  useEffect(() => {
    dispatch(setLocationData({}));
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!props.private) {
      setIsLoading(false);
    } else {
      if (!isLoggedIn()) {
        setDoRedirect(true);
        return;
      }
      if (authUser) {
        dispatch(getUsers()).then((action) => {
          const users = Array.isArray(action.payload) ? action.payload : [];
          const user = users.filter(u => u.email === authUser.email)[0];
          if (user) {
            setLocalUser(user);
            dispatch(setUser(user));
            dispatch(getMyAuthorizations(user.id)).then(() => {
              setIsLoading(false);
            }, () => {});
          }
        }, () => {
          localStorage.removeItem(auth0StorageKey);
          localStorage.setItem(auth0ErrorMessageKey, 'An error occured.');
          setDoRedirect(true);
        });
      }
    }
  // eslint-disable-next-line
  }, [props.private, authUser]);

  const handleOnLoad = useCallback(() => {
    if (props.onLoad) {
      props.onLoad(localUser, authUser);
    }
  }, [localUser, authUser, props]);

  const handleSideMenuLoad = useCallback((emptyState) => {
    setRealEmptyState(emptyState);
    setEmptyState(emptyState && props.useEmptyState === true);
    setIsSideMenuLoading(false);
  }, [props.useEmptyState]);

  useEffect(() => {
    if (!isLoading) {
      handleOnLoad();
    }
  // eslint-disable-next-line
  }, [isLoading, history.location.pathname]);

  if (doRedirect) {
    return <Redirect to={`${Routes.Login}#${history.location.pathname}`} />;
  }

  return !isLoading && !props.keepLoading ? (
    !props.blank ? (
      <div className={`${styles.container} ${props.className || ''}`}>
        <div className={styles.head}>
          <Header
            authUser={authUser}
            localUser={localUser}
            isSocialLogin={isSocialLogin}
            logo={customLogo}
            slogan={customSlogan}
          />
        </div>
        <div className={styles.body}>
          {props.showSideBar !== false && (!realEmptyState || isSuperUser(localUser.id)) && (
            <div className={styles.side}>
              <SideMenu
                userId={localUser.id}
                autoselect={!props.independent}
                onLoad={handleSideMenuLoad}
              />
            </div>
          )}
          <div className={styles.content}>
            {(!emptyState || isSuperUser(localUser.id)) ? (
              (!isSideMenuLoading || props.showSideBar === false) ? (
                <>{props.children}</>
              ) : (
                <Loader size={5} />
              )
            ) : (
              <div className={styles.emptyState}>
                <EmptyState />
                <span>You don’t have access to any project or reports</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : (
      <>{props.children}</>
    )
  ) : (
    <Loader size={5} />
  );
};

export default Screen;
