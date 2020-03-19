import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './PermissionsGranter.module.css';
import { getClients } from '../store/clients/actions';
import { getUsers } from '../store/users/actions';
import Search from './Search';
import { MdPlayArrow, MdSettings } from 'react-icons/md';
import Toggle from './Toggle';

const PermissionsGranter = () => {
  const dispatch = useDispatch();
  const clients = useSelector(state => state.clientsReducer.clients);
  const users = useSelector(state => state.usersReducer.users);

  useEffect(() => {
    if (!clients.length) {
      dispatch(getClients());
    }
    if (!users.length) {
      dispatch(getUsers());
    }
  }, [clients, users]);

  const [openGroups, setOpenGroups] = useState({});
  const [activeItems, setActiveItems] = useState({});

  const toggleGroupOpen = (id) => {
    setOpenGroups({ ...openGroups, [id]: !openGroups[id] });
  };

  const toggleGroupSettings = (id, event) => {
    // @TODO Settings ?
    event.stopPropagation();
  };

  const onSearch = (value) => {
    // @TODO Implement search
  };

  const handleItemActiveChange = (id, status) => {
    setActiveItems({ ...activeItems, [id]: status});
    // @TODO Update ... ?
  };

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="Search user" />
      </div>
      <div className={styles.permissions}>
        {!!clients && clients.map(client => (
          <div className={styles.group} key={`permissions-group-${client.id}`}>
            <div className={styles.groupTitle} onClick={e => toggleGroupOpen(client.id, e)}>
              <div>
                <MdPlayArrow className={`${styles.arrow} ${!!openGroups[client.id] ? styles.open : ''}`} />
                <span className={styles.groupName}>{client.name}</span>
              </div>
              <MdSettings
                className={styles.groupSettings}
                onClick={e => toggleGroupSettings(client.id, e)}
              />
            </div>
            {!!openGroups[client.id] && (
              <div className={styles.items}>
                {/* @TODO Filter users by domain_id when available */}
                {users.map(user => (
                  <div className={styles.item} key={`grant-user-${user.id}`}>
                    <span className={styles.itemName}>{user.email}</span>
                    <Toggle
                      id={`user-toggle-${user.id}`}
                      className={styles.itemToggle}
                      active={!!activeItems[user.id]}
                      onChange={status => handleItemActiveChange(user.id, status)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionsGranter;
