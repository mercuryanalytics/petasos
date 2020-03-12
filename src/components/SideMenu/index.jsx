import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { getClient, getClients } from '../../store/clients/actions';
import { getProject, getProjects } from '../../store/projects/actions';
import { getReport, getReports } from '../../store/reports/actions';
import Search from '../Search';
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
  const [openClients, setOpenClients] = useState({});
  const [openProjects, setOpenProjects] = useState({});

  useEffect(() => {
    dispatch(getClients());
    dispatch(getProjects());
  }, []);

  const onSearch = (value) => {
    // @TODO Implement search
  };

  const onClientOpen = (client) => {
    if (!openClients[client.id]) {
      dispatch(getProjects(client.id));
      setOpenClients({ ...openClients, [client.id]: true });
    }
  };

  const onProjectOpen = (project) => {
    if (!openProjects[project.id]) {
      dispatch(getReports(project.id));
      setOpenProjects({ ...openProjects, [project.id]: true });
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
      if (task.type === TaskTypes.ShowReport) {
        let r = reports.filter(r => r.id === task.target)[0];
        if (r) {
          setTask({ type: TaskTypes.OpenProject, target: r.project_id });
        } else {
          dispatch(getReport(task.target));
        }
      } else if (task.type === TaskTypes.OpenProject) {
        let p = projects.filter(p => p.id === task.target)[0];
        if (p) {
          setOpenProjects({ ...openProjects, [p.id]: true });
          setTask({ type: TaskTypes.OpenClient, target: p.domain_id });
          dispatch(getReports(task.target));
        } else {
          dispatch(getProject(task.target));
        }
      } else if (task.type === TaskTypes.OpenClient) {
        let c = clients.filter(c => c.id === task.target)[0];
        if (c) {
          setOpenClients({ ...openClients, [c.id]: true});
          setTask(null);
          dispatch(getProjects(task.target))
        } else {
          dispatch(getClient(task.target));;
        }
      }
    }
  }, [task, reports, projects, clients]);

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="Search by project" onSearch={onSearch} />
      </div>
      {clients && !!clients.length && clients.map(client => (
        <Client
          key={`client-btn-${client.id}`}
          data={client}
          projects={projects.filter(p => p.domain_id === client.id)}
          openProjects={openProjects}
          reports={reports}
          open={!!openClients[client.id]}
          active={activeClient === client.id}
          activeProject={activeProject}
          activeReport={activeReport}
          onOpen={onClientOpen}
          onProjectOpen={onProjectOpen}
        />
      ))}
      <div className={styles.add}>
        <ClientAdd />
      </div>
    </div>
  );
};

export default SideMenu;
