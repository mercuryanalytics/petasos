import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ResourceActions.module.css';
import Loader from './Loader';
import Avatar from './Avatar';
import Toggle from './Toggle';
import { Checkbox } from './FormFields';
import { InfoStroke } from './Icons';
import { MdPlayArrow } from 'react-icons/md';
import { FiFile } from 'react-icons/fi';
import { TiFolder } from 'react-icons/ti';
import { getClients, getClient } from '../store/clients/actions';
import { getProjects } from '../store/projects/actions';
import { getReports, getClientReports } from '../store/reports/actions';
import { getAuthorizedUsers, authorizeUser } from '../store/users/actions';

const ResourceActions = props => {
  const { clientId, userId } = props;
  const dispatch = useDispatch();
  const authorizedUsers = useSelector(state => state.usersReducer.authorizedUsers);
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

  const initClientAuthorizations = useCallback(async (id) => {
    await dispatch(getAuthorizedUsers(id, { clientId: id }));
  });
  const initProjectAuthorizations = useCallback(async (id, cid) => {
    await dispatch(getAuthorizedUsers(cid, { projectId: id }));
  });
  const initReportAuthorizations = useCallback(async (id, cid) => {
    await dispatch(getAuthorizedUsers(cid, { reportId: id }));
  });

  const init = useCallback(async () => {
    const initClients = async () => {
      await dispatch(clientId ? getClient(clientId) : getClients()).then(async (action) => {
        let data = action.payload;
        data = Array.isArray(data) ? data : [data];
        let promises = [];
        for (let i = 0; i < data.length; i++) {
          promises.push(initClientAuthorizations(data[i].id));
        }
        await Promise.all(promises).then(() => {
          const clientToOpen = clientId || (data.length ? data[0].id : null);
          setClients(data);
          handleClientToggle(clientToOpen, true);
        });
      });
    };
    return await Promise.all([initClients()]);
  }, [clientId]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setOpenClients({});
      setOpenProjects({});
      init().then(() => setIsLoading(false));
    }
  }, [clientId, userId]);

  const handleClientToggle = useCallback(async (id, forced) => {
    const status = forced ? !forced : !!openClients[id];
    setOpenClients(prev => ({ ...prev, [id]: !status }));
    if (!loadedClients[id]) {
      await Promise.all([
        dispatch(getProjects(id)).then(async (action) => {
          let promises = [];
          for (let i = 0; i < action.payload.length; i++) {
            const p = action.payload[i];
            promises.push(initProjectAuthorizations(p.id, p.domain_id));
          }
          await Promise.all(promises).then(() => {
            setProjects(prev => ({ ...prev, [id]: action.payload }));
          });
        }),
        dispatch(getClientReports(id)).then(async (action) => {
          let promises = [];
          for (let i = 0; i < action.payload.length; i++) {
            const r = action.payload[i];
            promises.push(initReportAuthorizations(r.id, r.project.domain_id));
          }
          await Promise.all(promises).then(() => {
            setClientReports(prev => ({ ...prev, [id]: action.payload }));
          });
        }),
      ]).then(() => {
        setLoadedClients(prev => ({ ...prev, [id]: true }));
      });
    }
  }, [openClients, loadedClients]);

  const handleProjectToggle = useCallback(async (id) => {
    const status = !!openProjects[id];
    setOpenProjects(prev => ({ ...prev, [id]: !status }));
    if (!loadedProjects[id]) {
      await dispatch(getReports(id)).then(async (action) => {
        let promises = [];
        for (let i = 0; i < action.payload.length; i++) {
          let r = action.payload[i];
          promises.push(initReportAuthorizations(r.id, r.project.domain_id));
        }
        await Promise.all(promises).then(() => {
          setReports(prev => ({ ...prev, [id]: action.payload }));
          setLoadedProjects(prev => ({ ...prev, [id]: true }));
        });
      });
    }
  }, [openProjects, loadedProjects]);

  const getItemStatus = useCallback((type, id, cid, stack) => {
    const currentState = activeStates[`${type}-${id}`];
    if (currentState === true || currentState === false) {
      return currentState;
    }
    const users = stack || authorizedUsers[`${type}-${id}@${cid}`];
    if (users) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user.id === userId && user.client_ids.indexOf(cid) > -1 && user.authorized) {
          return true;
        }
      }
    }
    return false;
  }, [userId, authorizedUsers, activeStates]);

  const setItemStatus = useCallback((type, id, cid, status) => {
    const options = { [`${type}Id`]: id };
    let newStates = {};
    dispatch(authorizeUser(userId, cid, options, status));
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
      dispatch(getAuthorizedUsers(cid, itemOptions)).then((action) => {
        const _status = getItemStatus(itemType, itemId, action.payload);
        if (status && !_status) {
          dispatch(authorizeUser(userId, cid, itemOptions, status));
        }
      });
    };
    const handleProjectReports = (projectId) => {
      dispatch(getReports(projectId)).then(action => action.payload.forEach((r) => {
        handleItem('report', r.id, true);
      }));
    };
    const handleClientContents = (clientId) => {
      dispatch(getProjects(clientId)).then(action => action.payload.forEach((p) => {
        handleItem('project', p.id, true);
        handleProjectReports(p.id);
      }));
      dispatch(getClientReports(clientId)).then(action => action.payload.forEach((r) => {
        handleItem('report', r.id, true);
      }));
    };
    if (type === 'client') {
      handleClientContents(id);
    } else if (type === 'project') {
      handleProjectReports(id);
    }
    setActiveStates(prev => ({ ...prev, ...newStates }));
  }, [userId, getItemStatus]);

  const renderCheckboxesTitles = useCallback(() => (
    <div className={styles.checkboxesTitles}>
      <div className={styles.checkboxTitle}>
        <span>View</span>
        <InfoStroke />
      </div>
      <div className={styles.checkboxTitle}>
        <span>Edit</span>
        <InfoStroke />
      </div>
      <div className={styles.checkboxTitle}>
        <span>Admin</span>
        <InfoStroke />
      </div>
    </div>
  ));

  const renderCheckboxes = useCallback(() => (
    <>
      <Checkbox
        className={styles.itemCheckbox}
        onChange={() => console.log('changed!')}
      />
      <Checkbox
        className={styles.itemCheckbox}
        onChange={() => console.log('changed!')}
      />
    </>
  ));

  return !isLoading ? (
    <div className={styles.container}>
      <div className={styles.edit}>
        {renderCheckboxesTitles()}
        {!!clients.length ? <>
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
                  checked={getItemStatus('client', client.id, client.id)}
                  onChange={status => setItemStatus('client', client.id, client.id, status)}
                />
                {renderCheckboxes()}
              </div>
              {!!openClients[client.id] && (!!loadedClients[client.id] ? (
                (
                  (!!projects[client.id] && !!projects[client.id].length) ||
                  (!!clientReports[client.id] && !!clientReports[client.id].length)
                ) ? <>
                  {projects[client.id].map(project => (
                    <div key={project.id} className={`${styles.project} ${!clientId ? styles.indented : ''}`}>
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
                          checked={getItemStatus('project', project.id, project.domain_id)}
                          onChange={status => setItemStatus('project', project.id, project.domain_id. status)}
                        />
                        {renderCheckboxes()}
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
                                  checked={getItemStatus('report', report.id, report.project.domain_id)}
                                  onChange={status =>
                                    setItemStatus('report', report.id, report.project.domain_id, status)}
                                />
                                {renderCheckboxes()}
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
                        <FiFile className={styles.icon} />
                        <span className={styles.name}>{clientReport.name}</span>
                        <Toggle
                          id={`client-report-toggle-${clientReport.id}`}
                          className={styles.itemToggle}
                          checked={getItemStatus('report', clientReport.id, clientReport.project.domain_id)}
                          onChange={status =>
                            setItemStatus('report', clientReport.id, clientReport.project.domain_id, status)}
                        />
                        {renderCheckboxes()}
                      </div>
                    </div>
                  ))}
                </> : (
                  <div className={styles.noResults}>No results</div>
                )
              ) : (
                <Loader inline className={styles.loader} />
              ))}
            </div>
          ))}
        </> : (
          <div className={styles.noResults}>No results</div>
        )}
      </div>
    </div>
  ) : (
    <div className={styles.loaderContainer}>
      <Loader inline className={styles.loader} />
    </div>
  );
};

export default ResourceActions;
