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
};

const PermissionsGranter = props => {
  const { mode, clientId, projectId, reportId } = props;
  const dispatch = useDispatch();
  const [currentClientId, setCurrentClientId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const [activeItems, setActiveItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const users = useSelector(state => state.usersReducer.users);
  const clients = useSelector(state => state.clientsReducer.clients);
  const [didLoadUsers, setDidLoadUsers] = useState(false);
  const [didLoadClients, setDidLoadClients] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [visibleClients, setVisibleClients] = useState([]);
  const [statesBackup, setStatesBackup] = useState(null);

  useEffect(() => {
    dispatch(getUsers()).then(() => setDidLoadUsers(true));
    dispatch(getClients()).then(() => setDidLoadClients(true));
  }, []);

  useEffect(() => {
    if (didLoadUsers && didLoadClients) {
      setIsReady(true);
    }
  }, [didLoadUsers, didLoadClients]);

  useEffect(() => {
    const id = typeof clientId !== 'undefined' ? clientId : null;
    if (id !== currentClientId) {
      setCurrentClientId(id);
      setOpenGroups({ [id]: true });
    }
    if (isReady && id !== null) {
      let vu = [], vc = [], vcids = {}, f = null;
      if (isSearching) {
        f = filter.toLowerCase();
        if (!statesBackup) {
          setStatesBackup({ ...openGroups });
        }
      }
      users.forEach(u => {
        if (
          (!isSearching || (u.contact_name || u.email || '').toLowerCase().includes(f)) &&
          u.membership_ids.length
        ) {
          if (mode === PermissionsGranterModes.Manage) {
            if (id !== null && u.membership_ids.indexOf(id) > -1) {
              vu.push(u);
              vcids[id] = true;
            }
          } else {
            vu.push(u);
            u.membership_ids.forEach(mid => vcids[mid] = true);
          }
        }
      });
      clients.forEach(c => {
        !!vcids[c.id] && vc.push(c);
      });
      setVisibleUsers(vu);
      setVisibleClients(vc);
      if (isSearching) {
        setOpenGroups(vcids);
      } else if (statesBackup) {
        setOpenGroups(statesBackup);
        setStatesBackup(null);
      }
    }
  }, [users, clients, clientId, isReady, isSearching, filter]);

  const toggleGroupOpen = (id) => {
    setOpenGroups({ ...openGroups, [id]: !openGroups[id] });
  };

  const toggleGroupSettings = (id, event) => {
    // @TODO Settings ?
    event.stopPropagation();
  };

  const handleItemSelect = (id) => {
    if (mode === PermissionsGranterModes.Manage) {
      setSelectedItem(id);
      if (props.onUserSelect) {
        props.onUserSelect(id);
      }
    }
  };

  useEffect(() => {
    if (mode === PermissionsGranterModes.Manage && selectedItem === null && visibleUsers.length) {
      handleItemSelect(visibleUsers[0].id);
    }
  }, [selectedItem, visibleUsers]);

  const handleItemActiveChange = (id, status) => {
    setActiveItems({ ...activeItems, [id]: status});
  };

  const handleItemDelete = (id) => {
    setIsDeleteBusy({ ...isDeleteBusy, [id]: true });
    dispatch(deleteUser(id)).then(() =>
      setIsDeleteBusy({ ...isDeleteBusy, [id]: false }));
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
      if (!isNaN(projectId)) {
        result.project_id = projectId;
      } else if (!isNaN(reportId)) {
        result.report_id = reportId;
      }
      dispatch(createUser(result)).then(() => {
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
        {visibleClients.map(client => (
          <div className={styles.group} key={`permissions-group-${client.id}`}>
            {mode === PermissionsGranterModes.Grant && (
              <div
                className={styles.groupTitle}
                onClick={e => toggleGroupOpen(client.id, e)} title={client.name}
              >
                <div>
                  <MdPlayArrow className={`${styles.arrow} ${!!openGroups[client.id] ? styles.open : ''}`} />
                  <span className={styles.groupName}>{client.name}</span>
                </div>
                <MdMoreHoriz
                  className={styles.groupSettings}
                  onClick={e => toggleGroupSettings(client.id, e)}
                />
              </div>
            )}
            {!!openGroups[client.id] && (
              <div className={styles.items}>
                {visibleUsers.filter(u => u.membership_ids.indexOf(client.id) > -1).map(user => (
                  <label
                    key={`grant-user-${user.id}`}
                    className={`
                      ${styles.item}
                      ${mode === PermissionsGranterModes.Manage ? styles.noIndent : ''}
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
                    {(mode === PermissionsGranterModes.Grant && (
                      <Toggle
                        id={`user-toggle-${client.id}-${user.id}`}
                        className={styles.itemToggle}
                        active={!!activeItems[user.id]}
                        onChange={status => handleItemActiveChange(user.id, status)}
                      />
                    )) ||
                    (mode === PermissionsGranterModes.Manage && (
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
            )}
          </div>
        ))}
        {!isReady ? (
          <Loader inline className={styles.loader} />
        ) : (!visibleClients.length && (
          <span className={styles.noResults}>No results</span>
        ))}
      </div>
    </div>
  );
};

export default PermissionsGranter;
