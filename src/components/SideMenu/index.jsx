import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { getClients } from '../../store/clients/actions';
import { getProjects } from '../../store/projects/actions';
import { getReports } from '../../store/reports/actions';
import Search from '../Search';
import Client from './Client';
import ClientAdd from './ClientAdd';


const SideMenu = () => {
  const dispatch = useDispatch();
  const clients = useSelector(state => state.clientsReducer.clients);
  const projects = useSelector(state => state.projectsReducer.projects);
  const reports = useSelector(state => state.reportsReducer.reports);
  const activeClient = useSelector(state => state.locationReducer.data.client);
  const activeProject = useSelector(state => state.locationReducer.data.project);
  const activeReport = useSelector(state => state.locationReducer.data.report);
  const [clientsOpen, setClientsOpen] = useState({});
  const [projectsOpen, setProjectsOpen] = useState({});

  useEffect(() => {
    dispatch(getClients());
  }, []);

  const onSearch = (event) => {
    // @TODO Search what ?
  }

  const onClientOpen = (client) => {
    if (!clientsOpen[client.id]) {
      dispatch(getProjects(client.id));
      setClientsOpen({ ...clientsOpen, [client.id]: true });
      clientsOpen[client.id] = true;
    }
  };

  const onProjectOpen = (project) => {
    if (!projectsOpen[project.id]) {
      dispatch(getReports(project.id));
      setProjectsOpen({ ...projectsOpen, [project.id]: true });
    }
  };

  return (
    <div className={styles.container}>
      <Search onSearch={onSearch} />
      {clients && !!clients.length && clients.map(client => (
        <Client
          key={`client-btn-${client.id}`}
          data={client}
          projects={projects.filter(p => p.clientId === client.id)}
          projectsOpen={projectsOpen}
          // @TODO Filter reports by client
          reports={reports}
          open={!!clientsOpen[client.id]}
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
