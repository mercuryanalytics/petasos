import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './UserActions.module.css';
import { getClients } from '../store/clients/actions';
import { getUsers, createUser, deleteUser, getAuthorizedUsers, authorizeUser } from '../store/users/actions';
import { useForm, useField } from 'react-final-form-hooks';
import Loader from './Loader';
import Search from './Search';
import { MdPlayArrow, MdMoreHoriz, MdDelete } from 'react-icons/md';
import Toggle from './Toggle';
import Modal from './Modal';
import Button from './Button';
import { Input } from './FormFields';

export const UserActionsContexts = {
  Client: 'client',
  Project: 'project',
  Report: 'report',
};

export const UserActionsModes = {
  Grant: 'grant',
  Manage: 'manage',
};

const UserActions = props => {
  const { mode, context, clientId, projectId, reportId } = props;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [authorizedOptions, setAuthorizedOptions] = useState(null);
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [allowedClients, setAllowedClients] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeStates, setActiveStates] = useState({});
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const clients = useSelector(state => state.clientsReducer.clients);
  const users = useSelector(state => state.usersReducer.users);
  const authorizedUsers = useSelector(state => state.usersReducer.authorizedUsers);
  const [userNameFilter, setUserNameFilter] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedClients, setBlockedClients] = useState([]);
  const [openClientsBackup, setOpenClientsBackup] = useState(null);

  const handleItemSelect = useCallback((id) => {
    if (mode === UserActionsModes.Manage) {
      setSelectedItem(id);
      if (props.onUserSelect) {
        props.onUserSelect(id);
      }
    }
  }, [mode, props.onUserSelect]);

  const handleClientToggle = useCallback(async (id, forced) => {
    const status = forced ? !forced : !!openClients[id];
    setOpenClients(prev => ({ ...prev, [id]: !status }));
    if (!loadedClients[id]) {
      await Promise.all([
        dispatch(getUsers(id)),
        dispatch(getAuthorizedUsers(id, authorizedOptions)),
      ]).then(() => {
        setLoadedClients(prev => ({ ...prev, [id]: true }));
      });
    }
  }, [openClients, loadedClients, authorizedOptions]);

  useEffect(() => {
    if (!authorizedOptions) {
      return;
    }
    setIsLoading(true);
    setOpenClients({});
    dispatch(getClients()).then(() => {
      if (mode === UserActionsModes.Grant) {
        Promise.all([
          dispatch(getUsers()),
          dispatch(getAuthorizedUsers(clientId, authorizedOptions)),
        ]).then(() => setIsLoading(false));
        handleClientToggle(clientId, true);
        return;
      }
      setAllowedClients([clientId]);
      dispatch(getUsers(clientId)).then((action) => {
        handleClientToggle(clientId, true);
        setIsLoading(false);
        handleItemSelect(action.payload.length ? action.payload[0].id : null);
      });
    });
  }, [mode, clientId, authorizedOptions]);

  useEffect(() => {
    if (clientId || projectId || reportId) {
      let options = {};
      if (projectId) {
        options.projectId = projectId;
      } else if (reportId) {
        options.reportId = reportId;
      } else {
        options.clientId = clientId;
      }
      setAuthorizedOptions(options);
    }
  }, [clientId, projectId, reportId]);

  useEffect(() => {
    if (mode === UserActionsModes.Grant) {
      let allowedIds = [];
      users.forEach(u => u.client_ids.forEach(cid => allowedIds.push(cid)));
      setAllowedClients(allowedIds);
    }
  }, [users, mode]);

  const handleSettingsToggle = useCallback((id, event) => {
    // @TODO Open, implement settings
    event.stopPropagation();
  });

  const handleItemDelete = useCallback((id, event) => {
    setIsDeleteBusy(prev => ({ ...prev, [id]: true }));
    dispatch(deleteUser(id, clientId))
      .then(() => setIsDeleteBusy(prev => ({ ...prev, [id]: false })));
    event.stopPropagation();
  }, [clientId]);

  const getItemStatus = useCallback((parentId, itemId) => {
    const currentState = activeStates[`${parentId}-${itemId}`];
    if (currentState === true || currentState === false) {
      return currentState;
    }
    const resId = reportId || projectId || clientId;
    const _users = authorizedUsers[`${context}-${resId}@${parentId}`];
    if (_users) {
      for (let i = 0; i < _users.length; i++) {
        const user = _users[i];
        if (user.id === itemId && user.authorized) {
          return true;
        }
      }
    }
    return false;
  }, [clientId, projectId, reportId, authorizedUsers, activeStates]);

  const setItemStatus = useCallback((parentId, itemId, status) => {
    dispatch(authorizeUser(itemId, parentId, authorizedOptions, status));
    setActiveStates(prev => ({ ...prev, [`${parentId}-${itemId}`]: status }));
  }, [clientId, projectId, reportId, authorizedOptions]);

  const handleSearch = useCallback((value) => {
    if (!!value.length) {
      if (userNameFilter === null) {
        setOpenClientsBackup({ ...openClients });
      }
      setUserNameFilter(value);
    } else {
      if (openClientsBackup) {
        setOpenClients({ ...openClientsBackup });
        setOpenClientsBackup(null);
        setBlockedClients([]);
        setBlockedUsers([]);
      }
      setUserNameFilter(null);
    }
  }, [userNameFilter, openClients, openClientsBackup]);

  useEffect(() => {
    if (userNameFilter) {
      let filter = userNameFilter.toLowerCase();
      let buids = {}, bcids = {}, cids = {};
      users.forEach(u => {
        if ((u.contact_name || u.email || '').toLowerCase().includes(filter)) {
          u.client_ids.forEach(cid => cids[cid] = true);
        } else {
          buids[u.id] = true;
        }
      });
      clients.forEach(c => !cids[c.id] && (bcids[c.id] = true));
      setBlockedClients(Object.keys(bcids).map(x => +x));
      setBlockedUsers(Object.keys(buids).map(x => +x));
      for (let i in cids) {
        handleClientToggle(+i, true);
      }
    }
  }, [userNameFilter]);

  const { form, handleSubmit, pristine, submitting } = useForm({
    initialValues: { add_user_email: '' },
    validate: (values) => {
      let err;
      if (!values.add_user_email) {
        err = 'Field value is required.';
      } else if (!/^\w+([\+\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(values.add_user_email)) {
        err = 'Field value must be a valid email format.';
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
      if (projectId) {
        result.project_id = projectId;
      } else if (reportId) {
        result.report_id = reportId;
      }
      dispatch(createUser(result, mode === UserActionsModes.Manage)).then(() => {
        dispatch(getAuthorizedUsers(clientId, authorizedOptions));
        form.reset();
        setIsBusy(false);
        setIsAddUserOpen(false);
      });
    },
  });

  const addUserField = useField('add_user_email', form);

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="Search user" onSearch={handleSearch} />
      </div>
      <div className={styles.adders}>
        <button onClick={() => setIsAddUserOpen(true)}>+ Add user</button>
        <button onClick={() => setIsAddDomainOpen(true)}>+ Add domain</button>
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
            <Button type="submit" disabled={isBusy || submitting} loading={isBusy}>
              {!isBusy ? 'Invite new user' : 'Inviting new user'}
            </Button>
            <Button transparent onClick={() => setIsAddUserOpen(false)}>
              <span>Cancel</span>
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        className={styles.modal}
        title="Create new domain"
        open={isAddDomainOpen}
        onClose={() => setIsAddDomainOpen(false)}
      >
        <div className={styles.modalText}>
          From here ?
        </div>
        AddClientDomain
        {/* <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            className={styles.modalInput}
            field={addUserField}
            label="Email"
          />
          <div className={styles.modalButtons}>
            <Button type="submit" disabled={isBusy || submitting} loading={isBusy}>
              {!isBusy ? 'Invite new user' : 'Inviting new user'}
            </Button>
            <Button transparent onClick={() => setIsAddUserOpen(false)}>
              <span>Cancel</span>
            </Button>
          </div>
        </form> */}
      </Modal>
      <div className={styles.permissions}>
        {!isLoading ? (
          clients.map(client => (
            allowedClients.indexOf(client.id) > -1 &&
            blockedClients.indexOf(client.id) === -1
          ) && (
            <div className={styles.group} key={`permissions-group-${client.id}`}>
              {mode === UserActionsModes.Grant && (
                <div
                  className={styles.groupTitle}
                  title={client.name}
                  onClick={() => handleClientToggle(client.id)}
                >
                  <div>
                    <MdPlayArrow className={`${styles.arrow} ${!!openClients[client.id] ? styles.open : ''}`} />
                    <span className={styles.groupName}>{client.name}</span>
                  </div>
                  <MdMoreHoriz
                    className={styles.groupSettings}
                    onClick={e => handleSettingsToggle(client.id, e)}
                  />
                </div>
              )}
              {!!openClients[client.id] && (
                !!loadedClients[client.id] ? (
                  <div className={styles.items}>
                    {users.filter(u => (
                      u.client_ids.indexOf(client.id) > -1 &&
                      blockedUsers.indexOf(u.id) === -1
                    )).map(user => (
                      <label
                        key={`grant-user-${user.id}`}
                        className={`
                          ${styles.item}
                          ${mode === UserActionsModes.Manage ? styles.noIndent : ''}
                          ${selectedItem === user.id ? styles.selectedItem : ''}
                        `}
                        htmlFor={`user-toggle-${client.id}-${user.id}`}
                        title={user.name || user.email}
                        onClick={() => handleItemSelect(user.id)}
                      >
                        <span className={styles.itemName}>
                          {!!(user.contact_name && user.contact_name.length) ? user.contact_name : user.email}
                        </span>
                        {/* @TODO Pending status */}
                        {(mode === UserActionsModes.Grant && (
                          <Toggle
                            id={`user-toggle-${client.id}-${user.id}`}
                            className={styles.itemToggle}
                            checked={getItemStatus(client.id, user.id)}
                            onChange={status => setItemStatus(client.id, user.id, status)}
                          />
                        )) ||
                        (mode === UserActionsModes.Manage && (
                          !!isDeleteBusy[user.id] ? (
                            <Loader inline size={3} className={styles.busyLoader} />
                          ) : (
                            <MdDelete
                              className={styles.itemDelete}
                              onClick={e => handleItemDelete(user.id, e)}
                            />
                          )
                        ))}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Loader inline className={styles.loader} />
                )
              )}
            </div>
          ))
        ) : (
          <Loader inline className={styles.loader} />
        )}
      </div>
    </div>
  );
};

export default UserActions;
