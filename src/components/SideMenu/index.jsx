import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { getClients } from '../../store/clients/actions';
import { getProject, getProjects } from '../../store/projects/actions';
import { getReport, getReports } from '../../store/reports/actions';
import Search from '../Search';
import Loader from '../Loader';
import Client from './Client';
import ClientAdd from './ClientAdd';

const TaskTypes = {
  ShowReport: 'show-report',
  OpenProject: 'open-project',
  OpenClient: 'open-client',
};

const SideMenu = () => {
  const dispatch = useDispatch();
  const [task, setTask] = useState(null);
  const clients = useSelector(state => state.clientsReducer.clients);
  const projects = useSelector(state => state.projectsReducer.projects);
  const reports = useSelector(state => state.reportsReducer.reports);
  const activeClient = useSelector(state => state.locationReducer.data.client);
  const activeProject = useSelector(state => state.locationReducer.data.project);
  const activeReport = useSelector(state => state.locationReducer.data.report);
  const isActiveAddLink = useSelector(state => state.locationReducer.data.create);
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});

  useEffect(() => {
    dispatch(getClients());
  }, []);

  const handleClientOpen = (client) => {
    if (!openClients[client.id]) {
      setOpenClients({ ...openClients, [client.id]: true });
      if (!loadedClients[client.id]) {
        dispatch(getProjects(client.id))
          .then(() => setLoadedClients({ ...loadedClients, [client.id]: true }));
      }
    }
  };

  const handleClientClose = (client) => {
    if (openClients[client.id]) {
      setOpenClients({ ...openClients, [client.id]: false });
    }
  };

  const handleProjectOpen = (project) => {
    if (!openProjects[project.id]) {
      setOpenProjects({ ...openProjects, [project.id]: true });
      if (!loadedProjects[project.id]) {
        dispatch(getReports(project.id))
          .then(() => setLoadedProjects({ ...loadedProjects, [project.id]: true }));
      }
    }
  };

  const handleProjectClose = (project) => {
    if (openProjects[project.id]) {
      setOpenProjects({ ...openProjects, [project.id]: false });
    }
  };

  useEffect(() => {
    if (activeReport !== null) {
      setTask({ type: TaskTypes.ShowReport, target: activeReport });
    } else if (activeProject !== null) {
      setTask({ type: TaskTypes.OpenProject, target: activeProject });
    } else if (activeClient !== null) {
      setTask({ type: TaskTypes.OpenClient, target: activeClient });
    }
  }, [activeClient, activeProject, activeReport]);

  useEffect(() => {
    if (task) {
      switch (task.type) {
        case TaskTypes.ShowReport:
          let r = reports.filter(r => r.id === task.target)[0];
          if (r) {
            setTask({ type: TaskTypes.OpenProject, target: r.project_id });
          } else {
            dispatch(getReport(task.target));
          }
          break;
        case TaskTypes.OpenProject:
          let p = projects.filter(p => p.id === task.target)[0];
          if (p) {
            handleProjectOpen(p);
            setTask({ type: TaskTypes.OpenClient, target: p.domain_id });
          } else {
            dispatch(getProject(task.target));
          }
          break;
        case TaskTypes.OpenClient:
          let c = clients.filter(c => c.id === task.target)[0];
          if (c) {
            handleClientOpen(c);
            setTask(null);
          }
          break;
      }
    } else if (activeProject !== null) {
      let p = projects.filter(p => p.id === activeProject)[0];
      if (p && !openClients[p.domain_id]) {
        setTask({ type: TaskTypes.OpenClient, target: p.domain_id });
      }
    }
  }, [task, reports, projects, clients]);

  const onSearch = (value) => {
    // @TODO Implement search
  };

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="Search by project" onSearch={onSearch} />
      </div>
      {clients && !!clients.length ? (
        clients.map(client => (
          <Client
            key={`client-btn-${client.id}`}
            data={client}
            projects={projects.filter(p => p.domain_id === client.id)}
            openProjects={openProjects}
            loadedProjects={loadedProjects}
            reports={reports}
            open={!!openClients[client.id]}
            loaded={!!loadedClients[client.id]}
            active={activeClient === client.id}
            activeProject={activeProject}
            activeReport={activeReport}
            isActiveAddLink={isActiveAddLink}
            onOpen={handleClientOpen}
            onClose={handleClientClose}
            onProjectOpen={handleProjectOpen}
            onProjectClose={handleProjectClose}
          />
        ))
      ) : (
        <Loader inline className={styles.loader} />
      )}
      <div className={styles.add}>
        <ClientAdd />
      </div>
    </div>
  );
};

export default SideMenu;
