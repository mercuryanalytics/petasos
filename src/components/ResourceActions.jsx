import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ResourceActions.module.css';
import Loader from './Loader';
import Avatar from './Avatar';
import Toggle from './Toggle';
import { MdPlayArrow, MdFolder, MdInsertDriveFile } from 'react-icons/md';
import { getClient } from '../store/clients/actions';
import { getProjects } from '../store/projects/actions';
import { getReports } from '../store/reports/actions';
import { getAuthorizedUsers, authorizeUser } from '../store/users/actions';

const ResourceActions = props => {
  const { clientId, userId } = props;
  const [previousProps, setPreviousProps] = useState({ clientId: null, userId: null });
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [activeItems, setActiveItems] = useState({});
  const client = useSelector(state =>
    state.clientsReducer.clients.filter(c => c.id === clientId)[0] || null);
  const projects = useSelector(state =>
    client ? state.projectsReducer.projects.filter(p => p.domain_id === clientId) : []);
  const reports = useSelector(state => {
    const pids = {};
    projects.forEach(p => pids[p.id] = true);
    return state.reportsReducer.reports.filter(r => !!pids[r.project_id]);
  });
  const authorizedUsers = useSelector(state => state.usersReducer.authorizedUsers);
  const [blockedItems, setBlockedItems] = useState({});
  const [refreshActiveItems, setRefreshActiveItems] = useState(false);

  const init = async () => {
    return Promise.all([
      await dispatch(getClient(clientId)),
      await dispatch(getAuthorizedUsers(clientId, { clientId: clientId })),
      await dispatch(getProjects(clientId)),
    ]);
  };

  useEffect(() => {
    if (clientId !== previousProps.clientId || userId !== previousProps.userId) {
      setPreviousProps({ clientId, userId });
      setIsLoading(true);
      init().then(() => setRefreshActiveItems(true));
    }
  }, [clientId, userId]);

  useEffect(() => {
    for (let id in openProjects) {
      if (!!openProjects[id] && !loadedProjects[id]) {
        dispatch(getReports(id)).then(() => {
          setLoadedProjects({ ...loadedProjects, [id]: true });
        });
      }
    }
  }, [openProjects]);

  useEffect(() => {
    if (Object.keys(loadedProjects).length) {
      setRefreshActiveItems(true);
    }
  }, [loadedProjects]);

  useEffect(() => {
    let states = {}, pids = {};
    if (client) {
      const clientKey = `client-${clientId}@${clientId}`;
      (authorizedUsers[clientKey] || []).forEach(u =>
        u.id === userId && (states[clientId] = u.authorized));
    }
    if (projects.length) {
      let blocked = {};
      projects.forEach(p => {
        const key = `project-${p.id}@${clientId}`;
        const localKey = `${clientId}-${p.id}`;
        if (authorizedUsers.hasOwnProperty(key)) {
          (authorizedUsers[key] || []).forEach(u => {
            if (u.id === userId) {
              blocked[localKey] = false;
              states[localKey] = u.authorized;
            }
          });
        } else if (!blockedItems[localKey]) {
          blocked[localKey] = true;
          dispatch(getAuthorizedUsers(clientId, { projectId: p.id })).then(() => {
            setBlockedItems({ ...blockedItems, [localKey]: false });
            setRefreshActiveItems(true);
          });
        }
      });
      setBlockedItems({ ...blockedItems, ...blocked });
    }
    if (reports.length) {
      let blocked = {};
      reports.forEach(r => {
        const key = `report-${r.id}@${clientId}`;
        const localKey = `${clientId}-${r.project_id}-${r.id}`;
        if (authorizedUsers.hasOwnProperty(key)) {
          (authorizedUsers[key] || []).forEach(u => {
            if (u.id === userId) {
              blocked[localKey] = false;
              states[localKey] = u.authorized;
            }
          });
        } else if (!blockedItems[localKey]) {
          blocked[localKey] = true;
          dispatch(getAuthorizedUsers(clientId, { reportId: r.id })).then(() => {
            setBlockedItems({ ...blockedItems, [localKey]: false });
            setRefreshActiveItems(true);
          });
        }
      });
      setBlockedItems({ ...blockedItems, ...blocked });
    }
    setRefreshActiveItems(false);
    setActiveItems(states);
    setIsLoading(false);
  }, [refreshActiveItems]);

  const handleProjectToggle = (id) => {
    setOpenProjects({ ...openProjects, [id]: !openProjects[id] });
  };

  const handleClientStatusChange = (status) => {
    const key = `${clientId}`;
    if (status !== !!activeItems[key]) {
      dispatch(authorizeUser(userId, clientId, { clientId: clientId }))
        .then(() => setRefreshActiveItems(true));
    }
  };

  const handleProjectStatusChange = (id, status) => {
    const key = `${clientId}-${id}`;
    if (status !== !!activeItems[key]) {
      dispatch(authorizeUser(userId, clientId, { projectId: id }))
        .then(() => setRefreshActiveItems(true));
    }
  };

  const handleReportStatusChange = (id, pid, status) => {
    const key = `${clientId}-${pid}-${id}`;
    if (status !== !!activeItems[key]) {
      dispatch(authorizeUser(userId, clientId, { reportId: id }))
        .then(() => setRefreshActiveItems(true));
    }
  };

  return !isLoading ? (
    <div className={styles.container}>
      <div className={styles.client}>
        {client && (
          <div className={styles.title} title={client.name}>
            <Avatar className={styles.logo} avatar={client.logo} alt={client.name[0].toUpperCase()} />
            <span className={styles.name}>{client.name}</span>
            <Toggle
              id={`client-toggle-${client.id}`}
              className={styles.itemToggle}
              active={!!activeItems[client.id]}
              onChange={status => handleClientStatusChange(status)}
            />
          </div>
        )}
      </div>
      {!((projects || []).filter(p => (
        !!blockedItems[`${client.id}-${p.id}`]
      )).length) ? (
        !projects || !projects.length ? (
          <div className={styles.noResults}>No results</div>
        ) : projects.map(project => (
          <div key={project.id} className={styles.project}>
            <div
              className={styles.title}
              title={project.name}
              onClick={() => handleProjectToggle(project.id)}
            >
              <MdPlayArrow className={`${styles.arrow} ${!!openProjects[project.id] ? styles.open : ''}`} />
              <MdFolder className={styles.icon} />
              <span className={styles.name}>{project.name}</span>
              <Toggle
                id={`project-toggle-${project.id}`}
                className={styles.itemToggle}
                active={!!activeItems[`${client.id}-${project.id}`]}
                onChange={status => handleProjectStatusChange(project.id, status)}
              />
            </div>
            {!!openProjects[project.id] && (
              loadedProjects[project.id] && !((reports || []).filter(r => (
                !!blockedItems[`${client.id}-${project.id}-${r.id}`]
              )).length) ? (
                (!reports || !reports.filter(r => (
                  r.project_id === project.id
                )).length) ? (
                  <div className={styles.noResults}>No results</div>
                ) : !!reports && reports.filter(r => r.project_id === project.id).map(report => (
                  <div key={report.id} className={styles.report} title={report.name}>
                    <div className={styles.title}>
                      <MdInsertDriveFile className={styles.icon} />
                      <span className={styles.name}>{report.name}</span>
                      <Toggle
                        id={`report-toggle-${report.id}`}
                        className={styles.itemToggle}
                        active={!!activeItems[`${client.id}-${project.id}-${report.id}`]}
                        onChange={status => handleReportStatusChange(report.id, project.id, status)}
                      />
                    </div>
                  </div>
                ))
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
  ) : (
    <Loader inline className={styles.loader} />
  );
};

export default ResourceActions;
