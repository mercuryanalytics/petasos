import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ResourceActions.module.css';
import Loader from './Loader';
import Avatar from './Avatar';
import Toggle from './Toggle';
import { Checkbox } from './FormFields';
import { MdPlayArrow } from 'react-icons/md';
import { FiFile } from 'react-icons/fi';
import { TiFolder } from 'react-icons/ti';
import { getClient } from '../store/clients/actions';
import { getProjects } from '../store/projects/actions';
import { getReports, getClientReports } from '../store/reports/actions';
import { getAuthorizedUsers, authorizeUser } from '../store/users/actions';

const ResourceActions = props => {
  const { clientId, userId } = props;
  const dispatch = useDispatch();
  const authorizedUsers = useSelector(state => state.usersReducer.authorizedUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState({});
  const [clientReports, setClientReports] = useState([]);
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [activeStates, setActiveStates] = useState({});

  const init = useCallback(async () => {
    const initProjectAuthorizations = async (id) => {
      await dispatch(getAuthorizedUsers(clientId, { projectId: id }));
    }
    const initReportAuthorizations = async (id) => {
      await dispatch(getAuthorizedUsers(clientId, { reportId: id }));
    }
    return await Promise.all([
      dispatch(getClient(clientId)).then((action) => {
        setClient(action.payload);
      }),
      dispatch(getAuthorizedUsers(clientId, { clientId: clientId })),
      dispatch(getProjects(clientId)).then(async (action) => {
        let promises = [];
        for (let i = 0; i < action.payload.length; i++) {
          promises.push(initProjectAuthorizations(action.payload[i].id));
        }
        await Promise.all(promises).then(() => {
          setProjects(action.payload);
        });
      }),
      dispatch(getClientReports(clientId)).then(async (action) => {
        let promises = [];
        for (let i = 0; i < action.payload.length; i++) {
          promises.push(initReportAuthorizations(action.payload[i].id));
        }
        await Promise.all(promises).then(() => {
          setClientReports(action.payload);
        });
      }),
    ]);
  }, [clientId]);

  useEffect(() => {
    if (clientId && userId && (!client || client.id !== clientId)) {
      setIsLoading(true);
      setOpenProjects({});
      init().then(() => setIsLoading(false));
    }
  }, [clientId, userId]);

  const handleProjectToggle = useCallback(async (id) => {
    const initReportAuthorizations = async (id) => {
      await dispatch(getAuthorizedUsers(clientId, { reportId: id }));
    }
    const status = !!openProjects[id];
    setOpenProjects(prev => ({ ...prev, [id]: !status }));
    if (!loadedProjects[id]) {
      await dispatch(getReports(id)).then(async (action) => {
        let promises = [];
        for (let i = 0; i < action.payload.length; i++) {
          promises.push(initReportAuthorizations(action.payload[i].id));
        }
        await Promise.all(promises).then(() => {
          setReports(prev => ({ ...prev, [id]: action.payload }));
          setLoadedProjects(prev => ({ ...prev, [id]: true }));
        });
      });
    }
  }, [clientId, openProjects, loadedProjects]);

  const getItemStatus = useCallback((type, id, stack) => {
    const currentState = activeStates[`${type}-${id}`];
    if (currentState === true || currentState === false) {
      return currentState;
    }
    const users = stack || authorizedUsers[`${type}-${id}@${clientId}`];
    if (users) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user.id === userId && user.authorized) {
          return true;
        }
      }
    }
    return false;
  }, [clientId, userId, authorizedUsers, activeStates]);

  const setItemStatus = useCallback((type, id, status) => {
    const options = { [`${type}Id`]: id };
    let newStates = {};
    dispatch(authorizeUser(userId, clientId, options, status));
    newStates[`${type}-${id}`] = status;
    const handleItem = async (itemType, itemId, isAsync) => {
      const itemOptions = { [`${itemType}Id`]: itemId };
      if (status) {
        if (isAsync) {
          setActiveStates(prev => ({ ...prev, [`${itemType}-${itemId}`]: true }));
        } else {
          newStates[`${itemType}-${itemId}`] = true;
        }
      }
      dispatch(getAuthorizedUsers(clientId, itemOptions)).then((action) => {
        const _status = getItemStatus(itemType, itemId, action.payload);
        if (status && !_status) {
          dispatch(authorizeUser(userId, clientId, itemOptions, status));
        }
      });
    };
    const handleProjectReports = (projectId) => {
      dispatch(getReports(projectId)).then(action => action.payload.forEach((r) => {
        handleItem('report', r.id, true);
      }));
    };
    if (type === 'client') {
      projects.forEach(p => {
        handleItem('project', p.id);
        handleProjectReports(p.id);
      });
      clientReports.forEach(r => {
        handleItem('report', r.id);
      });
    } else if (type === 'project') {
      handleProjectReports(id);
    }
    setActiveStates(prev => ({ ...prev, ...newStates }));
  }, [clientId, userId, getItemStatus, activeStates, projects, clientReports]);

  return !isLoading ? (
    <div className={styles.container}>
      <div className={styles.edit}>
        <div className={styles.client}>
          {client && (
            <div
              className={styles.title}
              title={client.name}
            >
              <Avatar className={styles.logo} avatar={client.logo} alt={client.name[0].toUpperCase()} />
              <span className={styles.name}>{client.name}</span>
              <Toggle
                id={`client-toggle-${client.id}`}
                className={styles.itemToggle}
                checked={getItemStatus('client', client.id)}
                onChange={status => setItemStatus('client', client.id, status)}
              />
              <Checkbox
                className={styles.itemCheckbox}
                onChange={() => console.log('changed!')}
              />
              <Checkbox
                className={styles.itemCheckbox}
                onChange={() => console.log('changed!')}
              />
            </div>
          )}
          {!!projects.length || !!clientReports.length ? <>
            {projects.map(project => (
              <div key={project.id} className={styles.project}>
                <div
                  className={styles.title}
                  title={project.name}
                  onClick={() => handleProjectToggle(project.id)}
                >
                  <MdPlayArrow className={`${styles.arrow} ${!!openProjects[project.id] ? styles.open : ''}`} />
                  <TiFolder className={styles.icon} />
                  <span className={styles.name}>{project.name}</span>
                  <Toggle
                    id={`project-toggle-${project.id}`}
                    className={styles.itemToggle}
                    checked={getItemStatus('project', project.id)}
                    onChange={status => setItemStatus('project', project.id, status)}
                  />
                  <Checkbox
                    className={styles.itemCheckbox}
                    onChange={() => console.log('changed!')}
                  />
                  <Checkbox
                    className={styles.itemCheckbox}
                    onChange={() => console.log('changed!')}
                  />
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
                          <FiFile className={styles.icon} />
                          <span className={styles.name}>{report.name}</span>
                          <Toggle
                            id={`report-toggle-${report.id}`}
                            className={styles.itemToggle}
                            checked={getItemStatus('report', report.id)}
                            onChange={status => setItemStatus('report', report.id, status)}
                          />
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
            {clientReports.map(clientReport => (
              <div
                key={clientReport.id}
                className={styles.report}
                title={clientReport.name}
              >
                <div className={styles.title}>
                  <FiFile className={styles.icon} />
                  <span className={styles.name}>{clientReport.name}</span>
                  <Toggle
                    id={`client-report-toggle-${clientReport.id}`}
                    className={styles.itemToggle}
                    checked={getItemStatus('report', clientReport.id)}
                    onChange={status => setItemStatus('report', clientReport.id, status)}
                  />
                </div>
              </div>
            ))}
          </> : (
            <div className={styles.noResults}>No results</div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.loaderContainer}>
      <Loader inline className={styles.loader} />
    </div>
  );
};

export default ResourceActions;
