import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ResourceActions.module.css';
import Loader from './common/Loader';
import Avatar from './common/Avatar';
import Toggle from './common/Toggle';
import Scrollable from './common/Scrollable';
import Tooltip from './common/Tooltip';
import {Checkbox, Input, Validators} from './FormFields';
import { File, Folder, InfoStroke } from './Icons';
import { MdPlayArrow, MdFilterList } from 'react-icons/md';
import { getClients, getClient, getClientsFromSA } from '../store/clients/actions';
import { getProjects } from '../store/projects/actions';
import { getReports } from '../store/reports/actions';
import {
  getScopes,
  getUserAuthorizations,
  authorizeUser,
  copyPermissions,
  resetUserAuthorizations
} from '../store/users/actions';
import { getTemplates, updateTemplate } from '../store/clients/actions';
import {
  UserRoles, ResourceTypes,
  isUserAuthorized, isUserSpecificallyAuthorized, isUserTemplateAuthorized,
} from '../store';
import Button from "./common/Button";
import Modal from "./common/Modal";
import {useField, useForm} from "react-final-form-hooks";

const ResourceActions = props => {
  const { templateMode, clientId, userId, context } = props;
  const dispatch = useDispatch();
  const scopes = useSelector(state => state.usersReducer.scopes);
  const authorizations = useSelector(state => state.usersReducer.authorizations);
  const templates = useSelector(state => state.clientsReducer.templates);
  const contextUserId = !templateMode ? userId : null;
  const [isLoading, setIsLoading] = useState(true);
  const [permissionUpdating, setPermissionUpdating] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState({});
  const [reports, setReports] = useState({});
  const reportsSource = useSelector(state => state.reportsReducer.reports);
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [activeStates, setActiveStates] = useState({});
  const [rowActiveStates, setRowActiveStates] = useState({});
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [copyPermissionsModal, setCopyPermissionsModal] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [append, setAppend] = useState(false);
  const [errors, setErrors] = useState(null);
  const [showOnlyAccess, setShowOnlyAccess] = useState(false);


  const handleProjectToggle = useCallback(async (id, forced) => {
    const status = forced ? !forced : !!openProjects[id];
    setOpenProjects(prev => ({ ...prev, [id]: !status }));
    if (!loadedProjects[id]) {
      await dispatch(getReports(id)).then(async (action) => {
        setReports(prev => ({ ...prev, [id]: action.payload }));
        setLoadedProjects(prev => ({ ...prev, [id]: true }));
      }, () => {});
    }
  }, [openProjects, loadedProjects, dispatch]);

  const handleClientToggle = useCallback(async (id, openFirstProject, forced) => {
    const status = forced ? !forced : !!openClients[id];
    setOpenClients(prev => ({ ...prev, [id]: !status }));
    if (!loadedClients[id]) {
      let _projects;
      await Promise.all([
        dispatch(getProjects(id, contextUserId)).then(async (action) => {
          _projects = action.payload;
          setProjects(prev => ({ ...prev, [id]: action.payload }));
        }, () => {}),
      ]).then(() => {
        setLoadedClients(prev => ({ ...prev, [id]: true }));
        if (openFirstProject && _projects && _projects.length) {
          handleProjectToggle(_projects[0].id, true);
        }
      });
    } else if (openFirstProject) {
      try {
        handleProjectToggle(projects[id][0].id, true);
      } catch (e) {}
    }
  }, [openClients, loadedClients, projects, contextUserId, dispatch, handleProjectToggle]);

  const init = useCallback(async () => {
    const getClientAction = clientId ? getClient(clientId, contextUserId) : getClientsFromSA(contextUserId);
    let clientToOpen;
    let promises = [
      dispatch(getClientAction).then(async (action) => {
        let data = action.payload;
        data = Array.isArray(data) ? data : [data];
        clientToOpen = clientId || null;
        setClients(data);
      }, () => {}),
    ];
    if (!templateMode) {
      promises.push(
        dispatch(getScopes()).then((action) => {
          const data = action.payload.dynamic;
          if (data) {
            let initialFilters = {};
            for (let i = 0; i < data.length; i++) {
              initialFilters[data[i].id] = true;
              if (i === 2) {
                break;
              }
            }
            setFilters(initialFilters);
          }
        }, () => {}),
        dispatch(getUserAuthorizations(userId)).then(() => {}, () => {}),
      );
    } else {
      promises.push(
        dispatch(getTemplates(clientId)).then(() => {}, () => {}),
      );
    }
    await Promise.all(promises).then(() => {
      if (clientToOpen) {
        handleClientToggle(clientToOpen, !!clientId, true);
      }
    });
  }, [clientId, userId, contextUserId, templateMode, dispatch, handleClientToggle]);

  useEffect(() => {
    if (userId || templateMode) {
      setIsLoading(true);
      setOpenClients({});
      setOpenProjects({});
      init().then(() => setIsLoading(false));
    }
  // eslint-disable-next-line
  }, [clientId, userId, templateMode]);

  const getItemStatus = useCallback((type, id, role, scopeId, isGlobal) => {
    const currentState = activeStates[`${userId}-${type}-${id}-${role || scopeId || 'viewer'}`];
    if (currentState === true || currentState === false) {
      return currentState;
    }
    return !templateMode ? (
      !scopeId ? isUserSpecificallyAuthorized(authorizations, userId, type, id, role)
        : isUserAuthorized(authorizations, userId, type, id, null, scopeId, isGlobal)
    ) : isUserTemplateAuthorized(templates, clientId, type, id, role);
  }, [userId, clientId, authorizations, templateMode, templates, activeStates]);

  const refreshChildAccessStates = useCallback((type, id, status, clientId) => {
    let newStates = {};
    let projectStates = {}, clientState = false;
    const checkAccess = (t, i) => {
      return (t === type && i === id) ? status : getItemStatus(t, i);
    };
    reportsSource.forEach(report => {
      if (report.project.domain_id === clientId && !projectStates[report.project_id]) {
        if (checkAccess(ResourceTypes.Report, report.id)) {
          projectStates[report.project_id] = true;
        }
      }
    });
    (projects[clientId] || []).forEach(project => {
      const accessKey = `${ResourceTypes.Project}-${project.id}`;
      const hasAccess = !!projectStates[project.id] || checkAccess(ResourceTypes.Project, project.id);
      if (hasAccess) {
        clientState = true;
        if (!rowActiveStates[accessKey]) {
          newStates[accessKey] = true;
        }
      } else if (rowActiveStates[accessKey]) {
        newStates[accessKey] = false;
      }
    });
    clients.forEach(client => {
      if (client.id === clientId) {
        const accessKey = `${ResourceTypes.Client}-${client.id}`;
        const hasAccess = clientState || checkAccess(ResourceTypes.Client, client.id);
        if (hasAccess) {
          if (!rowActiveStates[accessKey]) {
            newStates[accessKey] = true;
          }
        } else if (rowActiveStates[accessKey]) {
          newStates[accessKey] = false;
        }
      }
    });
    setRowActiveStates(prev => ({ ...prev, ...newStates }));
  }, [clients, projects, reportsSource, rowActiveStates, getItemStatus]);

  const setItemStatus = useCallback((type, id, parentId, status, role, scopeId, isGlobal, context) => {
    let newStates = { [[`${userId}-${type}-${id}-${role || scopeId || 'viewer'}`]]: status };
    let options, states, promises = [];
    const getAuthorizeAction = (options, states) => {
      if (!templateMode) {
        return authorizeUser(userId, parentId, options, states, context);
      }
      const data = {
        resource_type: type,
        resource_id: id,
        state: states.authorize ? 1 : 0,
      };
      if (states.role) {
        data.role = states.role;
        data.role_state = states.role_state;
      }
      return updateTemplate(clientId, data);
    };
    if (scopeId) {
      options = { [`${type}Id`]: id, isGlobal: isGlobal };
      states = {
        scope_id: scopeId,
        scope_state: status ? 1 : 0,
      };
    } else if (role === UserRoles.ClientAccess ||  role === UserRoles.ProjectAccess) {
      options = { [`${type}Id`]: id };
      states = {
        role: role,
        role_state: status ? 1 : 0,
      };
      if (status) {
        states.authorize = true;
        newStates[`${userId}-${type}-${id}-viewer`] = true;
      }
    } else {
      const rolePrefix = type[0].toUpperCase() + type.substr(1);
      const managerRole = UserRoles[`${rolePrefix}Manager`];
      const adminRole = UserRoles[`${rolePrefix}Admin`];
      options = { [`${type}Id`]: id };
      states = {};
      if (role) {
        states.role = role;
        states.role_state = status ? 1 : 0;
        if (status) {
          states.authorize = true;
          newStates[`${userId}-${type}-${id}-viewer`] = true;
          if (role === adminRole) {
            newStates[`${userId}-${type}-${id}-${managerRole}`] = true;
            promises.push(dispatch(getAuthorizeAction(options, { role: managerRole, role_state: 1, authorize: true }))
              .then(() => {}, () => {}));
          }
        } else {
          if (role === managerRole) {
            newStates[`${userId}-${type}-${id}-${adminRole}`] = false;
            promises.push(dispatch(getAuthorizeAction(options, { role: adminRole, role_state: 0 }))
              .then(() => {}, () => {}));
          }
        }
      } else {
        states.authorize = status;
        if (!status) {
          const grantableAccess = type === 'client' ?
            UserRoles.ClientAccess : (type === 'project' ? UserRoles.ProjectAccess : null);
          newStates[`${userId}-${type}-${id}-${managerRole}`] = false;
          newStates[`${userId}-${type}-${id}-${adminRole}`] = false;
          promises.push(dispatch(getAuthorizeAction(options, { role: managerRole, role_state: 0 }))
            .then(() => {}, () => {}));
          promises.push(dispatch(getAuthorizeAction(options, { role: adminRole, role_state: 0 }))
            .then(() => {}, () => {}));
          if (grantableAccess) {
            newStates[`${userId}-${type}-${id}-${grantableAccess}`] = false;
            promises.push(dispatch(getAuthorizeAction(options, { role: grantableAccess, role_state: 0 }))
              .then(() => {}, () => {}));
          }
        }
      }
    }
    const hasAnyPermission = !role || role === UserRoles.Viewer ?
      status
      : (status || getItemStatus(type, id));
    refreshChildAccessStates(type, id, hasAnyPermission, parentId);
    promises.push(dispatch(getAuthorizeAction(options, states)).then(() => {}, () => {}));
    setPermissionUpdating(true);
    Promise.all(promises).then(() => {
      setPermissionUpdating(false);
      });
    setActiveStates(prev => ({ ...prev, ...newStates }))
  }, [userId, clientId, templateMode, refreshChildAccessStates, getItemStatus, dispatch]);

  const setFiltersStatus = useCallback((status, id) => {
    let newState = {};
    if (id) {
      newState[id] = status;
    } else {
      for (let i = 0; i < scopes.dynamic.length; i++) {
        newState[scopes.dynamic[i].id] = status;
      }
    }
    setFilters(prev => ({ ...prev, ...newState }));
  }, [scopes]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.keys(filters).filter(k => !!filters[k]).length;
  }, [filters]);

  const getFirstActiveFilterId = useCallback(() => {
    const keys = Object.keys(filters);
    for (let i = 0; i < keys.length; i++) {
      if (!!filters[keys[i]]) {
        return +keys[i];
      }
    }
    return null;
  }, [filters]);

  const getRowActiveClass = useCallback((type, res) => {
    let status;
    if (!templateMode) {
      const accessKey = `${type}-${res.id}`;
      status = rowActiveStates[accessKey];
      if (status !== true && status !== false) {
        status = !!res.children_access || getItemStatus(type, res.id);
      }
    }
    return status ? styles.active : '';
  }, [templateMode, rowActiveStates, getItemStatus]);

  const renderCheckboxTitle = useCallback((label, tooltip) => {
    return (
      <div className={`${styles.checkboxTitle} ${!tooltip ? styles.noTooltip : ''}`}>
        <div>
          <span>{label}</span>
          {!!tooltip && (
            <div>
              <Tooltip id={`${label.toLowerCase()}-permission-tt`} location="bottom" zIndex={5}>
                {tooltip}
              </Tooltip>
              <InfoStroke />
            </div>
          )}
        </div>
      </div>
    );
  }, []);

  const renderColumnCheckboxesTitles = useCallback(() => {
    return (
      <div className={styles.checkboxesTitles}>
        {renderCheckboxTitle('Access', (
          <div className={styles.tooltip}>
            <div className={styles.title}>Client level:</div>
            <span className={styles.item}>View the Client's and all it's Projects' and Reports' Details;</span>
            <div className={styles.title}>Project level:</div>
            <span className={styles.item}>View the Project's and all it's Reports' Details;</span>
          </div>
        ))}
        {renderCheckboxTitle('View', (
          <div className={styles.tooltip}>
            <div className={styles.title}>Client level:</div>
            <span className={styles.item}>View the Client's Details;</span>
            <div className={styles.title}>Project level:</div>
            <span className={styles.item}>View the Project's Details;</span>
            <div className={styles.title}>Report level:</div>
            <span className={styles.item}>View the Report's Details;</span>
          </div>
        ))}
        {renderCheckboxTitle('Edit', (
          <div className={styles.tooltip}>
            <div className={styles.title}>Client level:</div>
            <span className={styles.item}>Edit the Client's and all it's Projects' and Reports' Details;</span>
            <span className={styles.item}>Ability to Create / Delete Reports within the Client's Projects;</span>
            <div className={styles.title}>Project level:</div>
            <span className={styles.item}>Edit the Project's and all it's Reports' Details;</span>
            <span className={styles.item}>Ability to Create / Delete Reports within the Project;</span>
            <div className={styles.title}>Report level:</div>
            <span className={styles.item}>Edit the Report's Details;</span>
          </div>
        ))}
        {renderCheckboxTitle('Admin', (
          <div className={`${styles.tooltip} ${styles.fixed}`}>
            <div className={styles.title}>Client level:</div>
            <span className={styles.item}>Edit the Client's and all it's Projects' and Reports' Permissions;</span>
            <span className={styles.item}>Manage Accounts (Users/Domains/UserTemplate);</span>
            <span className={styles.item}>Ability to Create / Delete Projects and Reports within the Client;</span>
            <div className={styles.title}>Project level:</div>
            <span className={styles.item}>Edit the Project's and all it's Reports' Permissions;</span>
            <span className={styles.item}>Ability to Create / Delete Reports within the Project;</span>
            <div className={styles.title}>Report level:</div>
            <span className={styles.item}>Edit the Report's Permissions;</span>
          </div>
        ))}
        {!clientId && !!scopes.dynamic && !!getActiveFiltersCount() && <>
          <div
            className={styles.verticalSeparator}
            style={{ right: `${(getActiveFiltersCount() * 70) + 40}px` }}
          />
          {scopes.dynamic.map((s, i) => !!filters[s.id] && (
            <div
              key={`scope-title-${s.id}`}
              className={`
                ${styles.checkboxTitle}
                ${styles.noTooltip}
                ${styles.scoped}
                ${s.id === getFirstActiveFilterId() ? styles.separator : ''}
              `}
            >
              <div>{s.name}</div>
            </div>
          ))}
        </>}
      </div>
    );
  }, [clientId, filters, getActiveFiltersCount, getFirstActiveFilterId, renderCheckboxTitle, scopes]);

  const hasFilteredProjects = (client) =>{
    let p = projects[client.id].filter(project => getRowActiveClass('project', project) !== '' || project.children_access)
    return !!p.length;
  }

  const hasFilteredReports = (project) =>{
    let r = reports[project.id].filter(report => getRowActiveClass('report', report) !== '')
    return !!r.length;
  }

  const renderColumnCheckboxes = (resType, resId, parentId) => {
    const rolePrefix = resType[0].toUpperCase() + resType.substr(1);
    const managerRole = UserRoles[`${rolePrefix}Manager`];
    const adminRole = UserRoles[`${rolePrefix}Admin`];
    return <>
      <Checkbox
        className={styles.itemCheckbox}
        checked={getItemStatus(resType, resId, managerRole)}
        onChange={e => setItemStatus(resType, resId, parentId, !!e.target.checked, managerRole, null, null, context)}
      />
      <Checkbox
        className={styles.itemCheckbox}
        checked={getItemStatus(resType, resId, adminRole)}
        onChange={e => setItemStatus(resType, resId, parentId, !!e.target.checked, adminRole, null, null, context)}
      />
      {!clientId && !!scopes.dynamic && scopes.dynamic.map((s, i) => !!filters[s.id] && (
        <Checkbox
          key={`scope-${s.id}`}
          className={`
            ${styles.itemCheckbox}
            ${styles.scoped}
            ${s.id === getFirstActiveFilterId() ? styles.separator : ''}
          `}
          disabled={s.scope !== `${resType}s`}
          checked={getItemStatus(resType, resId, null, s.id)}
          onChange={e => setItemStatus(resType, resId, parentId, !!e.target.checked, null, s.id, null, context)}
        />
      ))}
    </>;
  };

  const { form, handleSubmit, submitting } = useForm({
    validate: (values) => {
      let errors = {};
      if (!Validators.hasValue(values.copy_from_email)) {
        errors.copy_from_email = 'Field value is required.';
      }
      if (!Validators.isEmail(values.copy_from_email)) {
        errors.copy_from_email = 'Field value must be a valid email format.';
      }
      return undefined;
    },
    onSubmit: (values) => {
      setErrors(null);
      setIsBusy(true);
      const result = {
        copy_from: values.copy_from_email,
        append: append
      };

      dispatch(copyPermissions(userId, result)).then((action) => {
        const handleSuccess = () => {
          form.reset();
          setIsBusy(false);
          setCopyPermissionsModal(false);
          setIsLoading(true);
          setOpenClients({});
          setOpenProjects({});
          setRowActiveStates({});
          setActiveStates({});
          dispatch(resetUserAuthorizations(userId));
          init().then(() => setIsLoading(false))
        };
        let promises = [];

        Promise.all(promises).then(() => {
          handleSuccess();
        }, () => {
          setIsBusy(false);
        });
      }, (response) => {

          if (response.xhrHttpCode === 422) {
            setErrors('Wrong email');
          } else {
            setErrors('Something went wrong');
          }
          setIsBusy(false);
      });
    },
  });

  const copyFromEmail = useField('copy_from_email', form);

  const handleCopyPermissionClose = useCallback(() => {
    setCopyPermissionsModal(false);
    form.reset();
  }, [form]);


  return !isLoading ? (
    <div className={`${styles.container} ${!clientId ? styles.complete : ''} ${props.className || ''}`}>
      {permissionUpdating && (<div className={`${styles.nonClickable}`}><p>Permission updating, please wait.</p></div>)}
      {!clientId && (<>
        <div className={styles.globals}>
          <Modal
              className={styles.modal}
              title="Copy permissions from user"
              open={copyPermissionsModal}
              onClose={() => handleCopyPermissionClose()}
          >
            {errors && <div className={styles.modalTextError}>{errors}</div>}
            <div className={styles.modalText}>
              Enter the email address of user you wish to copy its permissions.
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <Input
                  className={`${styles.modalInput} ${styles.stacked}`}
                  field={copyFromEmail}
                  label="Email"
              />
              <label className={styles.labelModal}>
                <span>Append permissions</span>
                <Checkbox
                    className={`${styles.itemCheckbox} ${styles.stacked}`}
                    checked={append}
                    onChange={e => setAppend(!append)}
                />
              </label>
              <span className={styles.spanDescription}>By checking the above checkbox, the users old permission will be retained. If not, they will be overwritten!</span>

              <div className={styles.modalButtons}>
                <Button type="submit" disabled={isBusy || submitting} loading={isBusy}>
                  {!isBusy ? 'Copy user permissions' : 'Copying user permissions...'}
                </Button>
                <Button transparent onClick={() => setCopyPermissionsModal(false)}>
                  <span>Cancel</span>
                </Button>
              </div>
            </form>
          </Modal>
          <div className={`${styles.bigTitle} ${styles.justifyBetween}`}>
            <span>Global</span>
            <div className={styles.buttonContainer}>
              <Button onClick={() => setShowOnlyAccess(!showOnlyAccess) }>{showOnlyAccess ? 'Show all' : 'Show only active permissions'}</Button>
              <Button onClick={() => setCopyPermissionsModal(!copyPermissionsModal) }>Copy permissions from</Button>
            </div>
          </div>
          <div className={styles.globalCheckboxes}>
            {!!scopes.global && scopes.global.map(s => (
              <Checkbox
                key={`global-scope-${s.id}`}
                className={['admin','research'].includes(s.action) ? styles.local : ''}
                label={renderCheckboxTitle(s.name,
                  (s.action === 'admin' && (
                    <div className={styles.tooltip}>
                      <span className={`${styles.item} ${styles.clean}`}>
                        Full View/Edit/Admin rights throughout the application
                      </span>
                      <span className={`${styles.item} ${styles.clean}`}>
                        Ability to create/delete Clients
                      </span>
                      <span className={`${styles.item} ${styles.clean}`}>
                        Super Admin interface
                      </span>
                    </div>
                  )) ||
                  (s.action === 'research' && (
                    <div className={`${styles.tooltip} ${styles.fixed}`}>
                      <span className={`${styles.item} ${styles.clean}`}>
                      {'The Researcher flag defines which users show up as Research Contact '}
                      {'option when creating a new Project'}
                      </span>
                    </div>
                  ))
                )}
                checked={getItemStatus(null, null, null, s.id, true)}
                onChange={e => setItemStatus(null, null, null, !!e.target.checked, null, s.id, true, context)}
              />
            ))}
          </div>
        </div>
        <div className={styles.bigTitle}>
          <span>Client / Project / Report</span>
          {!!scopes && !!clients.length && (
            <div className={styles.filter} onMouseLeave={() => setShowFilters(false)}>
              <div className={styles.trigger} onMouseOver={() => setShowFilters(true)}>
                <MdFilterList className={styles.triggerIcon} />
                <span className={styles.triggerTitle}>All Permissions</span>
                <span className={styles.triggerTotal}>{getActiveFiltersCount()}</span>
              </div>
              {showFilters && (
                <div className={styles.items}>
                  <div className={styles.controls}>
                    <button onClick={() => setFiltersStatus(true)}>Select all</button>
                    <button onClick={() => setFiltersStatus(false)}>Clear all</button>
                  </div>
                  {scopes.dynamic.map((s, i) => (
                    <Checkbox
                      key={`permissions-filter-${i}`}
                      className={styles.itemRow}
                      label={renderCheckboxTitle(s.name)}
                      checked={!!filters[s.id]}
                      onChange={e => setFiltersStatus(!!e.target.checked, s.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </>)}
      <div className={styles.resources}>
      {renderColumnCheckboxesTitles()}
      <Scrollable className={styles.resourcesActions}>
        {!!clients.length ? (<>
          {(
              showOnlyAccess ?
                  clients.filter(client => getRowActiveClass('client', client) !== '' || client.children_access) :
                  clients
          ).map(client => (
            <div key={client.id} className={`${styles.client} ${getRowActiveClass('client', client)}`}>
              <div
                className={styles.title}
                title={client.name}
                onClick={() => !clientId && handleClientToggle(client.id)}
              >
                {!clientId && (
                  <MdPlayArrow className={`${styles.arrow} ${!!openClients[client.id] ? styles.open : ''}`} />
                )}
                <Avatar className={styles.logo} avatar={client.logo_url} alt={client.name[0].toUpperCase()} />
                <span className={styles.name}>{client.name}</span>
                <Checkbox
                  className={styles.itemCheckbox}
                  checked={getItemStatus('client', client.id, UserRoles.ClientAccess)}
                  onChange={e => setItemStatus('client', client.id, client.id, !!e.target.checked, UserRoles.ClientAccess, null, null, context)}
                />
                <Toggle
                  id={`client-toggle-${client.id}`}
                  className={styles.itemToggle}
                  checked={getItemStatus('client', client.id)}
                  onChange={status => setItemStatus('client', client.id, client.id, status, null, null, null, context)}
                />
                {renderColumnCheckboxes('client', client.id, client.id)}
              </div>
              {!!openClients[client.id] && (!!loadedClients[client.id] ? (
                ((showOnlyAccess && hasFilteredProjects(client)) || (!showOnlyAccess && !!projects[client.id] && !!projects[client.id].length)) ? (<>
                  {(showOnlyAccess ?
                      projects[client.id].filter(project => getRowActiveClass('project', project) !== '' || project.children_access) :
                      projects[client.id]
                  ).map(project => (
                    <div
                      key={project.id}
                      className={`
                        ${styles.project}
                        ${!clientId ? styles.indented : ''}
                        ${getRowActiveClass('project', project)}
                      `}
                    >
                      <div
                        className={styles.title}
                        title={project.name}
                        onClick={() => handleProjectToggle(project.id)}
                      >
                        <MdPlayArrow className={`${styles.arrow} ${!!openProjects[project.id] ? styles.open : ''}`} />
                        <Folder className={styles.icon} />
                        <span className={styles.name}>{project.project_number ?
                          project.project_number + ': ' : ''}{project.name}</span>
                        <Checkbox
                          className={styles.itemCheckbox}
                          checked={getItemStatus('project', project.id, UserRoles.ProjectAccess)}
                          onChange={e => setItemStatus('project', project.id, client.id, !!e.target.checked, UserRoles.ProjectAccess, null, null, context)}
                        />
                        <Toggle
                          id={`project-toggle-${project.id}`}
                          className={styles.itemToggle}
                          checked={getItemStatus('project', project.id)}
                          onChange={status => setItemStatus('project', project.id, project.domain_id, status, null, null, null, context)}
                        />
                        {renderColumnCheckboxes('project', project.id, project.domain_id)}
                      </div>
                      {!!openProjects[project.id] && (!!loadedProjects[project.id] ? (
                        ((showOnlyAccess && hasFilteredReports(project)) || (!showOnlyAccess && !!reports[project.id] && !!reports[project.id].length)) ? (
                              (showOnlyAccess ?
                                  reports[project.id].filter(report => getRowActiveClass('report', report) !== '') :
                                  reports[project.id]
                              ).map(report => (
                            <div
                              key={report.id}
                              className={`${styles.report} ${getRowActiveClass('report', report)}`}
                              title={report.name}
                            >
                              <div className={styles.title}>
                                <File className={styles.icon} />
                                <span className={styles.name}>{report.name}</span>
                                <Toggle
                                  id={`report-toggle-${report.id}`}
                                  className={styles.itemToggle}
                                  checked={getItemStatus('report', report.id)}
                                  onChange={status =>
                                    setItemStatus('report', report.id, report.project.domain_id, status, null, null, null, context)}
                                />
                                {renderColumnCheckboxes('report', report.id, report.project.domain_id)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={`${styles.noResults} ${!clientId ? styles.left : ''}`}>
                            No results
                          </div>
                        )
                      ) : (
                        <Loader inline className={`${styles.loader} ${!clientId ? styles.left : ''}`} />
                      ))}
                    </div>
                  ))}
                </>) : (
                  <div className={`${styles.noResults} ${!clientId ? styles.left : ''}`}>
                    No results
                  </div>
                )
              ) : (
                <Loader inline className={`${styles.loader} ${!clientId ? styles.left : ''}`} />
              ))}
            </div>
          ))}
        </>) : (
          <div className={styles.noResults}>No results</div>
        )}
      </Scrollable>
      </div>
    </div>
  ) : (
    <div className={styles.loaderContainer}>
      <Loader inline className={styles.loader} />
    </div>
  );
};

export default ResourceActions;
