import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { getClients } from '../../store/clients/actions';
import { getProject, getProjects, getOrphanProjects } from '../../store/projects/actions';
import { getReport, getReports, getOrphanReports } from '../../store/reports/actions';
import Search from '../Search';
import Loader from '../Loader';
import Client from './Client';
import ClientAdd from './ClientAdd';
import Project from './Project';
import Report from './Report';

const TaskTypes = {
  ShowReport: 'show-report',
  OpenProject: 'open-project',
  OpenClient: 'open-client',
};

const SearchTargets = {
  Clients: 'Clients',
  Projects: 'Projects',
  Reports: 'Reports',
};

const searchComponentTargets = {};
Object.keys(SearchTargets).forEach(key =>
  searchComponentTargets[SearchTargets[key]] = false);

const SideMenu = React.memo(() => {
  const dispatch = useDispatch();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const clients = useSelector(state => state.clientsReducer.clients);
  const projects = useSelector(state => state.projectsReducer.projects);
  const orphanProjects = useSelector(state => state.projectsReducer.orphans);
  const reports = useSelector(state => state.reportsReducer.reports);
  const orphanReports = useSelector(state => state.reportsReducer.orphans);
  const activeClient = useSelector(state => state.locationReducer.data.client);
  const activeProject = useSelector(state => state.locationReducer.data.project);
  const activeReport = useSelector(state => state.locationReducer.data.report);
  const isActiveAddLink = useSelector(state => state.locationReducer.data.create);
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [isLoadedSearchData, setIsLoadedSearchData] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [clientsFilter, setClientsFilter] = useState(null);
  const [projectsFilter, setProjectsFilter] = useState(null);
  const [reportsFilter, setReportsFilter] = useState(null);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredOrphanProjects, setFilteredOrphanProjects] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filteredOrphanReports, setFilteredOrphanReports] = useState([]);

  const init = async () => {
    return Promise.all([
      await dispatch(getClients()),
      await dispatch(getOrphanProjects()),
      await dispatch(getOrphanReports()),
    ]);
  };

  useEffect(() => {
    setIsLoading(true);
    init().then(() => setIsLoading(false));
  }, []);

  const handleClientOpen = (client) => {
    if (!openClients[client.id]) {
      setOpenClients({ ...openClients, [client.id]: true });
    }
    if (!loadedClients[client.id]) {
      dispatch(getProjects(client.id))
        .then(() => setLoadedClients({ ...loadedClients, [client.id]: true }));
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
    }
    if (!loadedProjects[project.id]) {
      dispatch(getReports(project.id))
        .then(() => setLoadedProjects({ ...loadedProjects, [project.id]: true }));
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
      const orphanProjectIds = {};
      const orphanReportIds = {};
      orphanProjects.forEach(p => orphanProjectIds[p.id] = true);
      orphanReports.forEach(r => orphanReportIds[r.id] = true);
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
  }, [task, reports, projects, orphanReports, orphanProjects, clients]);

  const initSearch = async () => {
    return Promise.all([
      await dispatch(getProjects()),
      await dispatch(getReports()),
    ]);
  };

  const handleSearch = (value, target) => {
    if (!isLoadedSearchData) {
      initSearch().then(() => setIsLoadedSearchData(true));
    }
    let filters = {
      [SearchTargets.Clients]: null,
      [SearchTargets.Projects]: null,
      [SearchTargets.Reports]: null,
    };
    if (!!value.length) {
      setIsSearching(true);
      if (filters.hasOwnProperty(target)) {
        filters[target] = value;
      }
    } else {
      setIsSearching(false);
    }
    setClientsFilter(filters[SearchTargets.Clients]);
    setProjectsFilter(filters[SearchTargets.Projects]);
    setReportsFilter(filters[SearchTargets.Reports]);
  };

  const [statesBackup, setStatesBackup] = useState(null);

  const filterStack = (stack, filter) => {
    filter = filter.toLowerCase();
    return stack.filter(i => i.name.toLowerCase().includes(filter));
  };

  useEffect(() => {
    if (isSearching && isLoadedSearchData) {
      if (clientsFilter) {
        setFilteredClients(filterStack(clients, clientsFilter));
        setFilteredOrphanProjects([]);
        setFilteredOrphanReports([]);
      } else if (projectsFilter) {
        const result = filterStack(projects, projectsFilter);
        let orphanResult = [];
        let orphanProjectIds = {}, ids = {};
        orphanProjects.forEach(p => orphanProjectIds[p.id] = true);
        result.forEach(p => {
          ids[p.domain_id] = true;
          if (!!orphanProjectIds[p.id]) {
            orphanResult.push(p);
          }
        });
        setFilteredClients(clients.filter(c => !!ids[c.id]));
        setFilteredProjects(result);
        setFilteredOrphanProjects(orphanResult);
        setFilteredOrphanReports([]);
      } else if (reportsFilter) {
        const result = filterStack(reports, reportsFilter);
        let orphanResult = [];
        let projectsResult = [];
        let orphanProjectsResult = [];
        let orphanProjectIds = {}, orphanReportIds = {};
        let pids = {}, cids = {};
        orphanProjects.forEach(p => orphanProjectIds[p.id] = true);
        orphanReports.forEach(r => orphanReportIds[r.id] = true);
        result.forEach(r => {
          pids[r.project_id] = true;
          if (!!orphanReportIds[r.id]) {
            orphanResult.push(r);
          }
        });
        projects.forEach(p => {
          if (!!pids[p.id]) {
            if (!!orphanProjectIds[p.id]) {
              orphanProjectsResult.push(p);
            } else {
              projectsResult.push(p);
              cids[p.domain_id] = true;
            }
          }
        });
        setFilteredClients(clients.filter(c => !!cids[c.id]));
        setFilteredProjects(projectsResult);
        setFilteredOrphanProjects(orphanProjectsResult);
        setFilteredReports(result);
        setFilteredOrphanReports(orphanResult);
      }
    }
  }, [projects, reports, clientsFilter, projectsFilter, reportsFilter, isSearching, isLoadedSearchData]);

  useEffect(() => {
    if (isSearching) {
      if (filteredClients.length) {
        let states = {}, state = projectsFilter || reportsFilter;
        filteredClients.forEach(c => states[c.id] = state || (c.id === activeClient));
        setOpenClients(states);
        if (state) {
          setLoadedClients(states);
        }
      }
      if (filteredProjects.length || filteredOrphanProjects.length) {
        let states = {}, state = !!reportsFilter;
        filteredProjects.forEach(p => states[p.id] = state || (p.id === activeProject));
        filteredOrphanProjects.forEach(p => states[p.id] = state || (p.id === activeProject));
        setOpenProjects(states);
        if (state) {
          setLoadedProjects(states);
        }
      }
    }
  }, [isSearching, filteredClients, filteredProjects, filteredOrphanProjects]);

  useEffect(() => {
    if (isSearching) {
      if (!statesBackup) {
        setStatesBackup({
          clients: { open: { ...openClients }, loaded: { ...loadedClients } },
          projects: { open: { ...openProjects }, loaded: { ...loadedProjects } },
        });
      }
    } else if (isLoadedSearchData) {
      if (statesBackup) {
        setOpenClients(statesBackup.clients.open);
        setLoadedClients(statesBackup.clients.loaded);
        setOpenProjects(statesBackup.projects.open);
        setLoadedProjects(statesBackup.projects.loaded);
        setStatesBackup(null);
      }
    }
  }, [isSearching, isLoadedSearchData]);

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search
          placeholder="Search"
          targets={searchComponentTargets}
          defaultTarget={SearchTargets.Clients}
          onSearch={handleSearch}
        />
      </div>
      {isLoading || (isSearching && !isLoadedSearchData) ? (
        <Loader inline className={styles.loader} />
      ) : (
        <>
          {clients && !!clients.length && (
            (isSearching ? filteredClients : clients).map(client => (
              <Client
                key={`client-btn-${client.id}`}
                data={client}
                projects={(isSearching ? filteredProjects : projects).filter(p => p.domain_id === client.id)}
                openProjects={openProjects}
                loadedProjects={loadedProjects}
                reports={(isSearching ? filteredReports : reports)}
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
          )}
          {orphanProjects && !!orphanProjects.length && (
            (isSearching ? filteredOrphanProjects : orphanProjects).map(project => (
              <Project
                key={`project-btn-${project.id}`}
                data={project}
                reports={reports.filter(r => r.project_id === project.id)}
                open={!!openProjects[project.id]}
                loaded={!!loadedProjects[project.id]}
                active={activeProject === project.id}
                activeReport={activeReport}
                isActiveAddLink={isActiveAddLink}
                onOpen={handleProjectOpen}
                onClose={handleProjectClose}
              />
            ))
          )}
          {orphanReports && !!orphanReports.length && (
            (isSearching ? filteredOrphanReports : orphanReports).map(report => (
              <Report
                key={`report-btn-${report.id}`}
                data={report}
                active={activeReport === report.id}
              />
            ))
          )}
        </>
      )}
      <div className={styles.add}>
        <ClientAdd />
      </div>
    </div>
  );
});

export default SideMenu;
