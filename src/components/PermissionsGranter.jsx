import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './PermissionsGranter.module.css';
import { getClients } from '../store/clients/actions';
import { getUsers } from '../store/users/actions';
import Search from './Search';
import { MdPlayArrow, MdSettings, MdDelete } from 'react-icons/md';
import Toggle from './Toggle';
import { Link } from 'react-router-dom';

export const PermissionsGranterModes = {
  Grant: 'grant',
  Manage: 'manage',
}

const PermissionsGranter = props => {
  const { mode } = props;
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

  const handleGroupDelete = (id, event) => {
    // @TODO Delete group
    event.stopPropagation();
  };

  const handleItemActiveChange = (id, status) => {
    setActiveItems({ ...activeItems, [id]: status});
    // @TODO Update ... ?
  };

  const handleItemDelete = (id, event) => {
    // @TODO Delete item
  };

  const handleSearch = (value) => {
    // @TODO Implement search
  };

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="Search user" onSearch={handleSearch} />
      </div>
      {mode === PermissionsGranterModes.Manage && (
        <div className={styles.adders}>
          <button>+ Add user</button>
          <button>+ Add domain</button>
        </div>
      )}
      <div className={styles.permissions}>
        {!!clients && clients.map(client => (
          <div className={styles.group} key={`permissions-group-${client.id}`}>
            <div className={styles.groupTitle} onClick={e => toggleGroupOpen(client.id, e)}>
              <div>
                <MdPlayArrow className={`${styles.arrow} ${!!openGroups[client.id] ? styles.open : ''}`} />
                <span className={styles.groupName}>{client.name}</span>
              </div>
              {(mode === PermissionsGranterModes.Grant && (
                <MdSettings
                  className={styles.groupSettings}
                  onClick={e => toggleGroupSettings(client.id, e)}
                />
              )) ||
              (mode === PermissionsGranterModes.Manage && (
                <MdDelete
                  className={styles.groupDelete}
                  onClick={e => handleGroupDelete(client.id, e)}
                />
              ))
              }
            </div>
            {!!openGroups[client.id] && (
              <div className={styles.items}>
                {/* @TODO Filter users by domain_id when available */}
                {users.map(user => (
                  <div className={styles.item} key={`grant-user-${user.id}`}>
                    <span className={styles.itemName}>{user.email}</span>
                    {(mode === PermissionsGranterModes.Grant && (
                      <Toggle
                        id={`user-toggle-${client.id}-${user.id}`}
                        className={styles.itemToggle}
                        active={!!activeItems[user.id]}
                        onChange={status => handleItemActiveChange(user.id, status)}
                      />
                    )) ||
                    (mode === PermissionsGranterModes.Manage && (
                      <MdDelete
                        className={styles.itemDelete}
                        onClick={e => handleItemDelete(client.id, e)}
                      />
                    ))}
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
