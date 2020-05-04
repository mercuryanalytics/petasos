import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ResourceActions.module.css';
import Loader from './Loader';
import Avatar from './Avatar';
import Toggle from './Toggle';
import Scrollable from './Scrollable';
import { Checkbox } from './FormFields';
import { File, Folder, InfoStroke } from './Icons';
import { MdPlayArrow } from 'react-icons/md';
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

  const init = useCallback(async () => {
    let clientToOpen;
    await Promise.all([
      dispatch(clientId ? getClient(clientId) : getClients()).then(async (action) => {
        let data = action.payload;
        data = Array.isArray(data) ? data : [data];
        clientToOpen = clientId || (data.length ? data[0].id : null);
        setClients(data);
      }, () => {}),
      dispatch(getScopes()).then(() => {}, () => {}),
      dispatch(getUserAuthorizations(userId)).then(() => {}, () => {}),
    ]).then(() => {
      if (clientToOpen) {
        handleClientToggle(clientToOpen, !!clientId, true);
      }
    });
  }, [clientId, userId]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setOpenClients({});
      setOpenProjects({});
      init().then(() => setIsLoading(false));
    }
  }, [clientId, userId]);

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
  }, [openClients, loadedClients, projects]);

  const handleProjectToggle = useCallback(async (id, forced) => {
    const status = forced ? !forced : !!openProjects[id];
    setOpenProjects(prev => ({ ...prev, [id]: !status }));
    if (!loadedProjects[id]) {
      await dispatch(getReports(id)).then(async (action) => {
        setReports(prev => ({ ...prev, [id]: action.payload }));
        setLoadedProjects(prev => ({ ...prev, [id]: true }));
      }, () => {});
    }
  }, [openProjects, loadedProjects]);

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
          if (role === adminRole) {
            newStates[`${userId}-${type}-${id}-${managerRole}`] = false;
            dispatch(authorizeUser(userId, parentId, options, { role: managerRole, role_state: 0 }))
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
  }, [userId, getItemStatus]);

  const renderCheckboxesTitles = useCallback(() => (
    <div className={styles.checkboxesTitles}>
      <div className={styles.checkboxTitle}>
        <div>View<span title=""><InfoStroke /></span></div>
      </div>
      <div className={styles.checkboxTitle}>
        <div>Edit<span title=""><InfoStroke /></span></div>
      </div>
      <div className={styles.checkboxTitle}>
        <div>Admin<span title=""><InfoStroke /></span></div>
      </div>
      {!clientId && !!scopes.dynamic && <>
        <div className={styles.verticalSeparator} style={{ right: `${(scopes.dynamic.length * 100) + 40}px` }}></div>
        {scopes.dynamic.map((s, i) => (
          <div
            key={`scope-title-${s.id}`}
            className={`${styles.checkboxTitle} ${styles.scoped} ${i === 0 ? styles.separator : ''}`}
          >
            <div>{s.name}<span title={s.description}><InfoStroke /></span></div>
          </div>
        ))}
      </>}
    </div>
  ));

  const renderCheckboxes = (resType, resId, parentId) => {
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
      {!clientId && !!scopes.dynamic && scopes.dynamic.map((s, i) => (
        <Checkbox
          key={`scope-${s.id}`}
          className={`${styles.itemCheckbox} ${styles.scoped} ${i === 0 ? styles.separator : ''}`}
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
                label={s.name}
                checked={getItemStatus(null, null, null, s.id, true)}
                onChange={e => setItemStatus(null, null, null, !!e.target.checked, null, s.id, true)}
              />
            ))}
          </div>
        </div>
        <div className={styles.bigTitle}>
          <span>Client / Project / Report</span>
        </div>
      </>)}
      <div className={styles.resources}>
      {renderCheckboxesTitles()}
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
                <Avatar className={styles.logo} avatar={client.logo} alt={client.name[0].toUpperCase()} />
                <span className={styles.name}>{client.name}</span>
                <Toggle
                  id={`client-toggle-${client.id}`}
                  className={styles.itemToggle}
                  checked={getItemStatus('client', client.id)}
                  onChange={status => setItemStatus('client', client.id, client.id, status)}
                />
                {renderCheckboxes('client', client.id, client.id)}
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
                        {renderCheckboxes('project', project.id, project.domain_id)}
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
                                {renderCheckboxes('report', report.id, report.project.domain_id)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.noResults}>No results</div>
                        )
                      ) : (
                        <Loader inline className={styles.loader} />
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
                        {renderCheckboxes('report', clientReport.id, clientReport.project.domain_id)}
                      </div>
                    </div>
                  ))}
                </>) : (
                  <div className={styles.noResults}>No results</div>
                )
              ) : (
                <Loader inline className={styles.loader} />
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
