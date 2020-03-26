import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './PermissionsGranter.module.css';
import { getClients } from '../store/clients/actions';
import { getUsers } from '../store/users/actions';
import Search from './Search';
import { MdPlayArrow, MdMoreHoriz, MdDelete } from 'react-icons/md';
import Toggle from './Toggle';

export const PermissionsGranterModes = {
  Grant: 'grant',
  Manage: 'manage',
}

const PermissionsGranter = props => {
  const { mode, clientId } = props;
  const dispatch = useDispatch();
  const [currentClientId, setCurrentClientId] = useState(null);
  const clients = useSelector(state => {
    let c = state.clientsReducer.clients;
    return currentClientId !== null && mode === PermissionsGranterModes.Manage ?
      c.filter(c => c.id === currentClientId)
      : c;
  });
  const users = useSelector(state => state.usersReducer.users);
  const [allowedClientIds, setAllowedClientIds] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState(null);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [openGroups, setOpenGroups] = useState({});
  const [activeItems, setActiveItems] = useState({});

  useEffect(() => {
    const id = typeof clientId !== 'undefined' ? clientId : null;
    setCurrentClientId(id);
    if (id !== null) {
      setOpenGroups({ ...openGroups, [id]: true });
    }
  }, [clientId]);

  useEffect(() => {
    if (!clients.length) {
      dispatch(getClients());
    }
    if (!users.length) {
      dispatch(getUsers());
    } else {
      for (let i in allowedClientIds) {
        return;
      }
      let ids = {};
      users.forEach(u => ids[u.client_id] = true);
      setAllowedClientIds(ids);
    }
  }, [clients, users]);

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
    if (!!value.length) {
      setIsSearching(true);
      setFilter(value);
    } else {
      setIsSearching(false);
      setFilter(null);
    }
  };

  const [statesBackup, setStatesBackup] = useState(null);

  useEffect(() => {
    if (isSearching) {
      if (!statesBackup) {
        setStatesBackup({ ...openGroups });
      }
      const f = filter.toLowerCase();
      const result = users.filter(u => u.contact_name.toLowerCase().includes(f));
      let cids = {};
      result.forEach(u => cids[u.client_id] = true);
      setFilteredClients(clients.filter(c => !!cids[c.id]));
      setFilteredUsers(result);
    } else {
      if (statesBackup) {
        setFilteredClients([]);
        setFilteredUsers([]);
        setOpenGroups(statesBackup ? { ...statesBackup } : {});
        setStatesBackup(null);
      }
    }
  }, [isSearching, filter]);

  useEffect(() => {
    if (isSearching && filteredClients.length) {
      let states = {};
      filteredClients.forEach(c => states[c.id] = true);
      setOpenGroups(states);
    }
  }, [isSearching, filteredClients]);

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
        {(isSearching ? filteredClients : clients.filter(c => !!allowedClientIds[c.id])).map(client => (
          <div className={styles.group} key={`permissions-group-${client.id}`}>
            <div className={styles.groupTitle} onClick={e => toggleGroupOpen(client.id, e)}>
              <div>
                <MdPlayArrow className={`${styles.arrow} ${!!openGroups[client.id] ? styles.open : ''}`} />
                <span className={styles.groupName}>{client.name}</span>
              </div>
              {(mode === PermissionsGranterModes.Grant && (
                <MdMoreHoriz
                  className={styles.groupSettings}
                  onClick={e => toggleGroupSettings(client.id, e)}
                />
              )) ||
              (mode === PermissionsGranterModes.Manage && (
                <MdDelete
                  className={styles.groupDelete}
                  onClick={e => handleGroupDelete(client.id, e)}
                />
              ))}
            </div>
            {!!openGroups[client.id] && (
              <div className={styles.items}>
                {(isSearching ? filteredUsers : users).map(user => (
                  <div className={styles.item} key={`grant-user-${user.id}`}>
                    <span className={styles.itemName}>{user.contact_name}</span>
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
