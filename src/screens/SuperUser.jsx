import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styles from './SuperUser.module.css';
import { setLocationData } from '../store/location/actions';
import Screen from './Screen';
import AccessRestricted from './AccessRestricted';
import UserActions, { UserActionsModes } from '../components/UserActions';
import UserManage from '../components/UserManage';
import ResourceActions from '../components/ResourceActions';
import { isSuperUser } from '../store';
import { useMediaQuery } from "react-responsive/src";

const Tabs = {
  Info: 1,
  Permissions: 2,
};

const SuperUser = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(Tabs.Info);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);
  const [showUserActions, setShowUserActions] = useState(true);
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1337 })
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const setCurrentTab = useCallback((tab) => {
    setTab(tab);
    if (isTablet) {
      setShowUserActions(!showUserActions);
    }
  }, [tab]);

  useEffect(() => {
    dispatch(setLocationData({ superUser: true }));
  // eslint-disable-next-line
  }, []);

  const handleScreenLoad = useCallback((user) => {
    setIsAccessBlocked(!isSuperUser(user.id));
  }, []);

  const handleUserSelect = useCallback((id) => {
    if (selectedUserId !== id) {
      setSelectedUserId(id);
      setTab(Tabs.Info);
    }
  }, [selectedUserId]);

  if (isMobile) {
    return (
        <div style={{ display: 'flex', 'alignItems': 'center', 'margin': '50px', 'justifyContent': 'center' }}>
          <h2>Our Workbench, Research Results Website and other Tools are optimized for access on Desktop, Laptop and Tablet.</h2>
        </div>
    );
  }

  return !isAccessBlocked ? (
    <Screen className={styles.container} private showSideBar={false} onLoad={handleScreenLoad}>
      <div className={styles.content}>
        {showUserActions && (
          <div className={styles.left}>
            <div className={styles.title}>
              <span>Users</span>
            </div>
            <UserActions
                className={styles.usersActions}
                mode={UserActionsModes.Manage}
                showClients={false}
                superAdminMode={true}
                selectedUserId={selectedUserId}
                onUserSelect={handleUserSelect}
                canCreate={true}
                canDelete={true}
            />
          </div>
        )}
        <div className={styles.right}>
          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${tab === Tabs.Info ? styles.active : ''}`}
              onClick={() => setCurrentTab(Tabs.Info)}
            >
              <span>User info</span>
            </div>
            <div
              className={`${styles.tab} ${tab === Tabs.Permissions ? styles.active : ''}`}
              onClick={() => setCurrentTab(Tabs.Permissions)}
            >
              <span>Access and Permissions</span>
            </div>
          </div>
          <div className={`
            ${styles.tabContent}
            ${tab === Tabs.Info || selectedUserId === null ? styles.spaced : ''}
          `}>
            {(tab === Tabs.Info && (
              selectedUserId !== null && (
                <UserManage id={selectedUserId} preview={true} embeded={true} canEdit={true} />
              )
            )) ||
            (tab === Tabs.Permissions && (
              selectedUserId !== null && (
                <ResourceActions userId={selectedUserId} context={'admin'} />
              )
            ))}
            {selectedUserId === null && (
              <div className={styles.noUser}>No selected user</div>
            )}
          </div>
        </div>
      </div>
    </Screen>
  ) : (
    <AccessRestricted />
  );
};

export default SuperUser;
