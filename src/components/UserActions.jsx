import React, { useState, useEffect } from 'react';
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
  const [userNameFilter, setUserNameFilter] = useState(null);
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [activeItems, setActiveItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const clients = useSelector(state => state.clientsReducer.clients);
  const users = useSelector(state => {
    let result = state.usersReducer.users;
    return mode === UserActionsModes.Grant ? result
      : result.filter(u => u.client_ids.indexOf(clientId) > -1);
  });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedClients, setBlockedClients] = useState([]);
  const [allowedClients, setAllowedClients] = useState([]);
  const authorizedUsers = useSelector(state => state.usersReducer.authorizedUsers);

  useEffect(() => {
    dispatch(getClients()).then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (mode === UserActionsModes.Grant) {
      dispatch(getUsers());
    }
  }, [mode]);

  useEffect(() => {
    if (mode === UserActionsModes.Grant) {
      let ids = {};
      users.forEach(u => u.client_ids.forEach(cid => ids[cid] = true));
      setAllowedClients(Object.keys(ids).map(x => +x));
    }
  }, [users, mode]);

  useEffect(() => {
    let authorizedOptions = {};
    if (projectId) {
      authorizedOptions.projectId = projectId;
    } else if (reportId) {
      authorizedOptions.reportId = reportId;
    } else {
      authorizedOptions.clientId = clientId;
    }
    for (let id in openClients) {
      if (!loadedClients[id]) {
        dispatch(getUsers(id));
        dispatch(getAuthorizedUsers(id, authorizedOptions)).then(() => {
          setLoadedClients({ ...loadedClients, [id]: true });
        });
      }
    }
  }, [openClients]);

  useEffect(() => {
    if (allowedClients.length) {
      let states = {};
      const keyPref = `${context}-${reportId || projectId || clientId}@`;
      allowedClients.forEach(cid => {
        let data = authorizedUsers[keyPref + cid] || [];
        data.forEach(u => u.client_ids.forEach(mcid => {
          if (allowedClients.indexOf(mcid) > -1) {
            states[`${mcid}-${u.id}`] = u.authorized;
          }
        }));
      });
      setActiveItems({ ...states });
    }
  }, [authorizedUsers, allowedClients]);

  useEffect(() => {
    if (mode === UserActionsModes.Manage) {
      setAllowedClients([clientId]);
    }
    setSelectedItem(null);
    setLoadedClients({ [clientId]: false });
    setOpenClients({ [clientId]: true });
  }, [mode, clientId, projectId, reportId]);

  const handleClientToggle = (id) => {
    setOpenClients({ ...openClients, [id]: !openClients[id] });
  };

  const handleSettingsToggle = (id, event) => {
    // @TODO Open, implement settings
    event.stopPropagation();
  };

  const handleItemDelete = (id) => {
    setIsDeleteBusy({ ...isDeleteBusy, [id]: true });
    dispatch(deleteUser(id, (!!clientId ? clientId : reportId.project.domain_id)))
      .then(() => setIsDeleteBusy({ ...isDeleteBusy, [id]: false }));
  };

  const handleItemActiveChange = (groupId, id, status) => {
    const key = `${groupId}-${id}`;
    if (status !== !!activeItems[key]) {
      let options = {};
      if (projectId) {
        options.projectId = projectId;
      } else if (reportId) {
        options.reportId = reportId;
      } else {
        options.clientId = clientId;
      }
      dispatch(authorizeUser(id, groupId, options));
    }
  };

  const handleItemSelect = (id) => {
    if (mode === UserActionsModes.Manage) {
      setSelectedItem(id);
      if (props.onUserSelect) {
        props.onUserSelect(id);
      }
    }
  };

  useEffect(() => {
    if (mode === UserActionsModes.Manage && !isLoading && users.length && selectedItem === null) {
      handleItemSelect(users[0].id);
    }
  }, [isLoading, mode, clientId, projectId, reportId, users, selectedItem]);

  const [openClientsBackup, setOpenClientsBackup] = useState(null);

  const handleSearch = (value) => {
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
  };

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
      setOpenClients(cids);
      setBlockedClients(Object.keys(bcids).map(x => +x));
      setBlockedUsers(Object.keys(buids).map(x => +x));
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
        client_id: !!clientId ? clientId : reportId.project.domain_id,
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
      dispatch(createUser(result, true)).then(() => {
        dispatch(getUsers());
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
              {isBusy && <Loader inline size={3} className={`${styles.busyLoader} ${styles.whiteLoader}`} />}
            </Button>
            <Button transparent onClick={() => setIsAddUserOpen(false)}>
              <span>Cancel</span>
            </Button>
          </div>
        </form>
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
                            active={!!activeItems[`${client.id}-${user.id}`]}
                            onChange={status => handleItemActiveChange(client.id, user.id, status)}
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
