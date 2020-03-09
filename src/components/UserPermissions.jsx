import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './UserPermissions.module.css';
import Search from './Search';
import { MdPlayArrow, MdSettings } from 'react-icons/md';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';

const UserPermissions = props => {
  const clients = useSelector(state => state.clientsReducer.clients);
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroupOpen = (id) => {
    setOpenGroups({ ...openGroups, [id]: !openGroups[id] });
  };

  const toggleGroupSettings = (id, event) => {
    event.stopPropagation();
  };

  const onSearch = () => {
    // @TODO
  };

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="Search user" />
      </div>
      <div className={styles.permissions}>
        {!!clients && clients.map(client => (
          <div className={styles.group} key={`permissions-group-${client.id}`}>
            <div className={styles.groupTitle} onClick={() => toggleGroupOpen(client.id)}>
              <div>
                <MdPlayArrow className={`${styles.arrow} ${false ? styles.open : ''}`} />
                <span className={styles.groupName}>{client.name}</span>
              </div>
              <MdSettings
                className={styles.groupSettings}
                onClick={e => toggleGroupSettings(client.id, e)}
              />
            </div>
            {!!openGroups[client.id] && (
              <div className={styles.items}>
                {/* @TODO Real users; fix key */}
                {['Russell Carter','Allen Saunders','Cecilia Douglas'].map(item => (
                  <div className={styles.item} key={`permissions-item-${item}`}>
                    <span className={styles.itemName}>{item}</span>
                    {/* <FaRegCheckCircle className={styles.itemStatus} /> */}
                    <FaRegTimesCircle className={styles.itemStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
};

export default UserPermissions;
