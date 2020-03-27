import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './PermissionsGranter.module.css';
import { getClients } from '../store/clients/actions';
import { getUsers, createUser, deleteUser } from '../store/users/actions';
import { useForm, useField } from 'react-final-form-hooks';
import Loader from './Loader';
import Search from './Search';
import { MdPlayArrow, MdMoreHoriz, MdDelete } from 'react-icons/md';
import Toggle from './Toggle';
import Modal from './Modal';
import Button from './Button';
import { Input } from './FormFields';

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
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    const id = typeof clientId !== 'undefined' ? clientId : null;
    setCurrentClientId(id);
    if (id !== null) {
      setOpenGroups({ [id]: true });
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
    // @TODO Delete group... all child users ?
    event.stopPropagation();
  };

  const handleItemActiveChange = (id, status) => {
    setActiveItems({ ...activeItems, [id]: status});
    // @TODO Update ... ?
  };

  const handleItemDelete = (id) => {
    dispatch(deleteUser(id)).then(() => {});
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
      setHasResults(!!result.length);
      setFilteredClients(clients.filter(c => !!cids[c.id]));
      setFilteredUsers(result);
    } else {
      setHasResults(!!users.length);
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

  const { form, handleSubmit, pristine, submitting } = useForm({
    initialValues: { add_user_email: '' },
    validate: (values) => {
      let err, email = values.add_user_email;
      if (!email) {
        err = 'Field value is required.';
      } else if (!/^\w+([\+\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        err = 'Field value must be a valid email format.'
      }
      return err ? { add_user_email: err } : {};
    },
    onSubmit: (values) => {
      setIsBusy(true);
      const result = {
        email: values.add_user_email,
        client_id: clientId,
        company_name: null,
        contact_name: null,
        contact_title: null,
        contact_phone: null,
        contact_fax: null,
        contact_email: null,
        mailing_address_1: null,
        mailing_address_2: null,
        mailing_city: null,
        mailing_state: null,
        mailing_zip: null,
      };
      dispatch(createUser(result)).then(() => {
        setIsBusy(false);
      });
    },
  });

  const addUserField = useField('add_user_email', form);

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="Search user" onSearch={handleSearch} />
      </div>
      {/* @TODO Keep this way ? */}
      {/* {mode === PermissionsGranterModes.Manage && ( */}
        <div className={styles.adders}>
          <button onClick={() => setIsAddUserOpen(true)}>+ Add user</button>
          <button>+ Add domain</button>
        </div>
        <Modal
          className={styles.modal}
          title="Invite new user"
          open={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
        >
          <div className={styles.modalText}>
            Enter an email address for which to send an invitation.
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              className={styles.modalInput}
              field={addUserField}
              label="Email"
            />
            <div className={styles.modalButtons}>
              <Button type="submit" disabled={isBusy || submitting}>
                <span>{!isBusy ? 'Invite new user' : 'Inviting new user'}</span>
                {isBusy && <Loader inline size={3} className={styles.busyLoader} />}
              </Button>
              <Button transparent onClick={() => setIsAddUserOpen(false)}>
                <span>Cancel</span>
              </Button>
            </div>
          </form>
        </Modal>
      {/* )} */}
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
                {(isSearching ? filteredUsers : users).filter(u => u.client_id === client.id).map(user => (
                  <label
                    key={`grant-user-${user.id}`}
                    className={styles.item}
                    htmlFor={`user-toggle-${client.id}-${user.id}`}
                  >
                    <span className={styles.itemName}>{user.contact_name}</span>
                    {/* @TODO Pending status */}
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
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        {!hasResults && (
          <span className={styles.noResults}>No results</span>
        )}
      </div>
    </div>
  );
};

export default PermissionsGranter;
