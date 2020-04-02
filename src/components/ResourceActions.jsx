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
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [activeItems, setActiveItems] = useState({});
  const client = useSelector(state =>
    state.clientsReducer.clients.filter(c => c.id === clientId)[0] || null);
  const projects = useSelector(state => state.projectsReducer.projects);
  const reports = useSelector(state => state.reportsReducer.reports);
  const authorizedUsers = useSelector(state => state.usersReducer.authorizedUsers);

  useEffect(() => {
    dispatch(getClient(clientId));
    dispatch(getAuthorizedUsers(clientId, { clientId: clientId }));
    dispatch(getProjects(clientId)).then(() => {
      projects.forEach(p => {
        if (p.domain_id === clientId) {
          console.log('@call', p.id)
          dispatch(getAuthorizedUsers(clientId, { projectId: p.id }))
        }
      });
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (
      clientId && client && clientId === client.id &&
      projects.length &&
      !Object.keys(openProjects).length
    ) {
      // setOpenProjects(projects[0].id);
    }
  }, [clientId, client, projects, openProjects]);

  useEffect(() => {
    for (let id in openProjects) {
      if (!loadedProjects[id]) {
        dispatch(getAuthorizedUsers(clientId, { projectId: id }));
        dispatch(getReports(id)).then(() => {
          reports.forEach(r => dispatch(getAuthorizedUsers(clientId, { reportId: r.id })));
          setLoadedProjects({ ...loadedProjects, [id]: true });
        });
      }
    }
  }, [openProjects]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    let states = {};
    if (client) {
      const clientKey = `client-${clientId}@${clientId}`;
      (authorizedUsers[clientKey] || []).forEach(u =>
        u.id === userId && (states[clientId] = u.authorized));
    }
    if (projects.length) {
      projects.forEach(p => {
        const key = `project-${p.id}@${clientId}`;
        (authorizedUsers[key] || []).forEach(u =>
          u.id === userId && (states[`${clientId}-${p.id}`] = u.authorized));
      });
    }
    if (reports.length) {
      reports.forEach(r => {
        const key = `report-${r.id}@${clientId}`;
        (authorizedUsers[key] || []).forEach(u =>
          u.id === userId && (states[`${clientId}-${r.project_id}-${r.id}`] = u.authorized));
      });
    }
    setActiveItems({ ...states });
  }, [authorizedUsers, userId, client, projects, reports]);

  const handleClientStatusChange = (status) => {
    const key = `${clientId}`;
    if (status !== !!activeItems[key]) {
      dispatch(authorizeUser(userId, clientId, { clientId: clientId }));
    }
  };

  const handleProjectStatusChange = (id, status) => {
    const key = `${clientId}-${id}`;
    if (status !== !!activeItems[key]) {
      dispatch(authorizeUser(userId, clientId, { projectId: id }));
    }
  };

  const handleReportStatusChange = (id, pid, status) => {
    const key = `${clientId}-${pid}-${id}`;
    if (status !== !!activeItems[key]) {
      dispatch(authorizeUser(userId, clientId, { reportId: id }));
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
      {!!projects && projects.filter(p => p.domain_id === clientId).map(project => (
        <div key={project.id} className={styles.project}>
          <div
            className={styles.title}
            title={project.name}
            onClick={() => setOpenProjects({ ...openProjects, [project.id]: !openProjects[project.id] })}
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
            loadedProjects[project.id] ? (
              <>
                {!!reports && reports.filter(r => r.project_id === project.id).map(report => (
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
                ))}
                {(!reports || !reports.filter(r => r.project_id === project.id).length) && (
                  <div className={styles.noResults}>No results</div>
                )}
              </>
            ) : (
              <Loader inline className={styles.loader} />
            )
          )}
        </div>
      ))}
    </div>
  ) : (
    <Loader inline className={styles.loader} />
  );
};

export default ResourceActions;
