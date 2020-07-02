import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ResourceActions.module.css';
import Loader from './common/Loader';
import Avatar from './common/Avatar';
import Toggle from './common/Toggle';
import Scrollable from './common/Scrollable';
import Tooltip from './common/Tooltip';
import { Checkbox } from './FormFields';
import { File, Folder, InfoStroke } from './Icons';
import { MdPlayArrow, MdFilterList } from 'react-icons/md';
import { getClients, getClient } from '../store/clients/actions';
import { getProjects } from '../store/projects/actions';
import { getReports, getClientReports } from '../store/reports/actions';
import { getScopes, getUserAuthorizations, authorizeUser } from '../store/users/actions';
import { UserRoles, isUserAuthorized } from '../store';

const ResourceActions = props => {
  const { clientId, userId } = props;
  const dispatch = useDispatch();
  const scopes = useSelector(state => state.usersReducer.scopes);
  const authorizations = useSelector(state => state.usersReducer.authorizations);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState({});
  const [reports, setReports] = useState({});
  const [clientReports, setClientReports] = useState({});
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [activeStates, setActiveStates] = useState({});
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

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
        dispatch(getProjects(id)).then(async (action) => {
          _projects = action.payload;
          setProjects(prev => ({ ...prev, [id]: action.payload }));
        }, () => {}),
        dispatch(getClientReports(id)).then(async (action) => {
          setClientReports(prev => ({ ...prev, [id]: action.payload }));
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
  }, [openClients, loadedClients, projects, dispatch, handleProjectToggle]);

  const init = useCallback(async () => {
    let clientToOpen;
    await Promise.all([
      dispatch(clientId ? getClient(clientId) : getClients()).then(async (action) => {
        let data = action.payload;
        data = Array.isArray(data) ? data : [data];
        clientToOpen = clientId || (data.length ? data[0].id : null);
        setClients(data);
      }, () => {}),
      dispatch(getScopes()).then((action) => {
        const data = action.payload.dynamic;
        let initialFilters = {};
        for (let i = 0; i < data.length; i++) {
          initialFilters[data[i].id] = true;
          if (i === 2) {
            break;
          }
        }
        setFilters(initialFilters);
      }, () => {}),
      dispatch(getUserAuthorizations(userId)).then(() => {}, () => {}),
    ]).then(() => {
      if (clientToOpen) {
        handleClientToggle(clientToOpen, !!clientId, true);
      }
    });
  }, [clientId, userId, dispatch, handleClientToggle]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setOpenClients({});
      setOpenProjects({});
      init().then(() => setIsLoading(false));
    }
  // eslint-disable-next-line
  }, [clientId, userId]);

  const getItemStatus = useCallback((type, id, role, scopeId, isGlobal) => {
    const currentState = activeStates[`${userId}-${type}-${id}-${role || scopeId || 'viewer'}`];
    if (currentState === true || currentState === false) {
      return currentState;
    }
    return !scopeId ?
      isUserAuthorized(authorizations, userId, type, id, role)
      : isUserAuthorized(authorizations, userId, type, id, null, scopeId, isGlobal);
  }, [userId, authorizations, activeStates]);

  const setItemStatus = useCallback((type, id, parentId, status, role, scopeId, isGlobal) => {
    let newStates = { [[`${userId}-${type}-${id}-${role || scopeId || 'viewer'}`]]: status };
    if (scopeId) {
      const options = { [`${type}Id`]: id, isGlobal: isGlobal };
      let states = {
        scope_id: scopeId,
        scope_state: status ? 1 : 0,
      };
      dispatch(authorizeUser(userId, parentId, options, states))
        .then(() => {}, () => {});
    } else {
      const rolePrefix = type[0].toUpperCase() + type.substr(1);
      const managerRole = UserRoles[`${rolePrefix}Manager`];
      const adminRole = UserRoles[`${rolePrefix}Admin`];
      const options = { [`${type}Id`]: id };
      let states = {};
      let skipCollections = false;
      const handleItem = async (_type, _id) => {
        const _options = { [`${_type}Id`]: _id };
        const _status = getItemStatus(_type, _id);
        if (status && !_status) {
          setActiveStates(prev => ({ ...prev, [`${userId}-${_type}-${_id}-viewer`]: true }));
          dispatch(authorizeUser(userId, parentId, _options, { authorize: true }))
            .then(() => {}, () => {});
        }
      };
      const handleProjectReports = async (_id) => {
        dispatch(getReports(_id)).then(action => action.payload.forEach((r) => {
          handleItem('report', r.id);
        }), () => {});
      };
      const handleClientContents = (_id) => {
        dispatch(getProjects(_id)).then(action => action.payload.forEach((p) => {
          handleItem('project', p.id);
          handleProjectReports(p.id);
        }), () => {});
        dispatch(getClientReports(_id)).then(action => action.payload.forEach((r) => {
          handleItem('report', r.id);
        }), () => {});
      };
      if (role) {
        states.role = role;
        states.role_state = status ? 1 : 0;
        if (status) {
          states.authorize = true;
          newStates[`${userId}-${type}-${id}-viewer`] = true;
          if (role === adminRole) {
            newStates[`${userId}-${type}-${id}-${managerRole}`] = true;
            dispatch(authorizeUser(userId, parentId, options, { role: managerRole, role_state: 1 }))
              .then(() => {}, () => {});
          }
        } else {
          skipCollections = true;
          if (role === managerRole) {
            newStates[`${userId}-${type}-${id}-${adminRole}`] = false;
            dispatch(authorizeUser(userId, parentId, options, { role: adminRole, role_state: 0 }))
              .then(() => {}, () => {});
          }
        }
      } else {
        states.authorize = status;
        if (!status) {
          newStates[`${userId}-${type}-${id}-${managerRole}`] = false;
          newStates[`${userId}-${type}-${id}-${adminRole}`] = false;
          dispatch(authorizeUser(userId, parentId, options, { role: managerRole, role_state: 0 }))
            .then(() => {}, () => {});
          dispatch(authorizeUser(userId, parentId, options, { role: adminRole, role_state: 0 }))
            .then(() => {}, () => {});
        }
      }
      dispatch(authorizeUser(userId, parentId, options, states)).then(() => {}, () => {});
      if (!skipCollections) {
        if (type === 'client') {
          handleClientContents(id);
        } else if (type === 'project') {
          handleProjectReports(id);
        }
      }
    }
    setActiveStates(prev => ({ ...prev, ...newStates }));
  }, [userId, getItemStatus, dispatch]);

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
        {renderCheckboxTitle('View', (
          <div className={styles.tooltip}>
            <span className={`${styles.item} ${styles.clean}`}>
              Client/Project/Report visibility on/off
            </span>
          </div>
        ))}
        {renderCheckboxTitle('Edit', (
          <div className={styles.tooltip}>
            <div className={styles.title}>Client level Edit Permissions:</div>
            <span className={styles.item}>Manage Users and Domains</span>
            <span className={styles.item}>Edit Client/Project/Report details</span>
            <div className={styles.title}>Project level Edit Permissions:</div>
            <span className={styles.item}>Manage Projects & Reports</span>
            <span className={styles.item}>Edit Project & Reports details</span>
            <div className={styles.title}>Report level Edit Permissions:</div>
            <span className={styles.item}>Edit Report details</span>
          </div>
        ))}
        {renderCheckboxTitle('Admin', (
          <div className={`${styles.tooltip} ${styles.fixed}`}>
            <div className={styles.title}>Client level Admin Permissions:</div>
            <span className={styles.item}>Manage the Client's visibility</span>
            <span className={styles.item}>
              Manage the Client's User Template (the data new users are provisioned with)
            </span>
            <div className={styles.title}>Project level Admin Permissions:</div>
            <span className={styles.item}>Manage the Project's visibility</span>
            <div className={styles.title}>Report level Admin Permissions:</div>
            <span className={styles.item}>Manage the Report's visibility</span>
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

  const renderColumnCheckboxes = (resType, resId, parentId) => {
    const rolePrefix = resType[0].toUpperCase() + resType.substr(1);
    const managerRole = UserRoles[`${rolePrefix}Manager`];
    const adminRole = UserRoles[`${rolePrefix}Admin`];
    return <>
      <Checkbox
        className={styles.itemCheckbox}
        checked={getItemStatus(resType, resId, managerRole)}
        onChange={e => setItemStatus(resType, resId, parentId, !!e.target.checked, managerRole)}
      />
      <Checkbox
        className={styles.itemCheckbox}
        checked={getItemStatus(resType, resId, adminRole)}
        onChange={e => setItemStatus(resType, resId, parentId, !!e.target.checked, adminRole)}
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
          onChange={e => setItemStatus(resType, resId, parentId, !!e.target.checked, null, s.id)}
        />
      ))}
    </>;
  };

  return !isLoading ? (
    <div className={`${styles.container} ${!clientId ? styles.complete : ''}`}>
      {!clientId && (<>
        <div className={styles.globals}>
          <div className={styles.bigTitle}>
            <span>Global</span>
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
                onChange={e => setItemStatus(null, null, null, !!e.target.checked, null, s.id, true)}
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
          {clients.map(client => (
            <div key={client.id} className={styles.client}>
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
                <Toggle
                  id={`client-toggle-${client.id}`}
                  className={styles.itemToggle}
                  checked={getItemStatus('client', client.id)}
                  onChange={status => setItemStatus('client', client.id, client.id, status)}
                />
                {renderColumnCheckboxes('client', client.id, client.id)}
              </div>
              {!!openClients[client.id] && (!!loadedClients[client.id] ? (
                (
                  (!!projects[client.id] && !!projects[client.id].length) ||
                  (!!clientReports[client.id] && !!clientReports[client.id].length)
                ) ? (<>
                  {projects[client.id].map(project => (
                    <div key={project.id} className={`${styles.project} ${!clientId ? styles.indented : ''}`}>
                      <div
                        className={styles.title}
                        title={project.name}
                        onClick={() => handleProjectToggle(project.id)}
                      >
                        <MdPlayArrow className={`${styles.arrow} ${!!openProjects[project.id] ? styles.open : ''}`} />
                        <Folder className={styles.icon} />
                        <span className={styles.name}>{project.name}</span>
                        <Toggle
                          id={`project-toggle-${project.id}`}
                          className={styles.itemToggle}
                          checked={getItemStatus('project', project.id)}
                          onChange={status => setItemStatus('project', project.id, project.domain_id, status)}
                        />
                        {renderColumnCheckboxes('project', project.id, project.domain_id)}
                      </div>
                      {!!openProjects[project.id] && (!!loadedProjects[project.id] ? (
                        (!!reports[project.id] && !!reports[project.id].length) ? (
                          reports[project.id].map(report => (
                            <div
                              key={report.id}
                              className={styles.report}
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
                                    setItemStatus('report', report.id, report.project.domain_id, status)}
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
                  {!!clientReports[client.id] && clientReports[client.id].map(clientReport => (
                    <div
                      key={clientReport.id}
                      className={`${styles.report} ${styles.orphan}`}
                      title={clientReport.name}
                    >
                      <div className={styles.title}>
                        <File className={styles.icon} />
                        <span className={styles.name}>{clientReport.name}</span>
                        <Toggle
                          id={`client-report-toggle-${clientReport.id}`}
                          className={styles.itemToggle}
                          checked={getItemStatus('report', clientReport.id)}
                          onChange={status =>
                            setItemStatus('report', clientReport.id, clientReport.project.domain_id, status)}
                        />
                        {renderColumnCheckboxes('report', clientReport.id, clientReport.project.domain_id)}
                      </div>
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
