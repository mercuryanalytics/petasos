import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { getClients } from '../../store/clients/actions';
import { getProject, getProjects, getOrphanProjects } from '../../store/projects/actions';
import { getReport, getReports, getOrphanReports, getClientReports } from '../../store/reports/actions';
import Search from '../Search';
import Loader from '../Loader';
import Client from './Client';
import ClientAdd from './ClientAdd';
import Project from './Project';
import Report from './Report';
import { UserRoles, isSuperUser, hasRoleOnProject } from '../../store';

const TaskTypes = {
  ShowReport: 'show-report',
  OpenProject: 'open-project',
  OpenClient: 'open-client',
};

const SearchTargets = {
  Clients: 'clients',
  Projects: 'projects',
  Reports: 'reports',
};

const searchComponentTargets = [
  { key: SearchTargets.Clients, label: 'Clients', value: false },
  { key: SearchTargets.Projects, label: 'Projects', value: true },
  { key: SearchTargets.Reports, label: 'Reports', value: true },
];

const SideMenu = props => {
  const { userId } = props;
  const dispatch = useDispatch();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const clients = useSelector(state => state.clientsReducer.clients);
  const projects = useSelector(state => state.projectsReducer.projects);
  const orphanProjects = useSelector(state => state.projectsReducer.orphans);
  const reports = useSelector(state => state.reportsReducer.reports);
  const orphanReports = useSelector(state => state.reportsReducer.orphans);
  const clientReports = useSelector(state => state.reportsReducer.clientReports);
  const activeClient = useSelector(state => state.locationReducer.data.client);
  const activeProject = useSelector(state => state.locationReducer.data.project);
  const activeReport = useSelector(state => state.locationReducer.data.report);
  const isActiveAddLink = useSelector(state => state.locationReducer.data.create);
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [canCreateProjects, setCanCreateProjects] = useState({});
  const [canCreateReports, setCanCreateReports] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    [SearchTargets.Clients]: false,
    [SearchTargets.Projects]: false,
    [SearchTargets.Reports]: false,
  });
  const [clientsSearch, setClientsSearch] = useState(false);
  const [projectsSearch, setProjectsSearch] = useState(false);
  const [isLoadedSearchData, setIsLoadedSearchData] = useState(false);
  const [statesBackup, setStatesBackup] = useState(null);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredOrphanProjects, setFilteredOrphanProjects] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filteredOrphanReports, setFilteredOrphanReports] = useState([]);
  const [filteredClientReports, setFilteredClientReports] = useState([]);

  const init = useCallback(async () => {
    return await Promise.all([
      dispatch(getClients()).then(() => {}, () => {}),
      dispatch(getOrphanProjects()).then(() => {}, () => {}),
      dispatch(getOrphanReports()).then(() => {}, () => {}),
    ]);
  });

  useEffect(() => {
    setIsLoading(true);
    init().then(() => setIsLoading(false));
  }, []);

  const initProjectCreationRights = useCallback((clientId, clientProjects) => {
    let canCreate = false;
    for (let i = 0; i < clientProjects.length; i++) {
      if (hasRoleOnProject(userId, clientProjects[i].id, UserRoles.ProjectManager)) {
        canCreate = true;
        break;
      }
    }
    setCanCreateProjects(prev => ({ ...prev, [clientId]: canCreate }));
  }, [userId]);

  const initReportCreationRights = useCallback((projectId) => {
    let canCreate = hasRoleOnProject(userId, projectId, UserRoles.ProjectManager);
    setCanCreateReports(prev => ({ ...prev, [projectId]: canCreate }));
  }, [userId]);

  const handleClientOpen = useCallback(async (client) => {
    if (!openClients[client.id]) {
      setOpenClients(prev => ({ ...prev, [client.id]: true }));
    }
    if (!loadedClients[client.id]) {
      let clientProjects;
      await Promise.all([
        dispatch(getClientReports(client.id)).then(() => {}, () => {}),
        dispatch(getProjects(client.id)).then((action) => (clientProjects = action.payload))
          .then(() => {}, () => {}),
      ]).then(() => {
        initProjectCreationRights(client.id, clientProjects);
        setLoadedClients(prev => ({ ...prev, [client.id]: true }));
      });
    }
  }, [openClients, loadedClients, userId]);

  const handleClientClose = useCallback((client) => {
    if (openClients[client.id]) {
      setOpenClients(prev => ({ ...prev, [client.id]: false }));
    }
  }, [openClients]);

  const handleProjectOpen = useCallback((project) => {
    if (!openProjects[project.id]) {
      setOpenProjects(prev => ({ ...prev, [project.id]: true }));
    }
    if (!loadedProjects[project.id]) {
      dispatch(getReports(project.id)).then(() => {
        initReportCreationRights(project.id);
        setLoadedProjects(prev => ({ ...prev, [project.id]: true }));
      }, () => {});
    }
  }, [openProjects, loadedProjects]);

  const handleProjectClose = useCallback((project) => {
    if (openProjects[project.id]) {
      setOpenProjects(prev => ({ ...prev, [project.id]: false }));
    }
  }, [openProjects]);

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
    if (!isLoading && task) {
      switch (task.type) {
        case TaskTypes.ShowReport:
          let r = reports.filter(r => r.id === task.target)[0];
          if (r) {
            setTask({
              type: TaskTypes.OpenProject,
              target: r.project_id,
              reportId: r.id,
              clientId: r.project.domain_id,
            });
          } else {
            dispatch(getReport(task.target)).then(() => {}, () => {});
          }
          break;
        case TaskTypes.OpenProject:
          let p = projects.filter(p => p.id === task.target)[0];
          if (p) {
            handleProjectOpen(p);
            setTask({ type: TaskTypes.OpenClient, target: p.domain_id });
          } else {
            dispatch(getProject(task.target)).then(action => {
              if (action.type === 'GET_PROJECT_FAILURE' && task.clientId) {
                dispatch(getClientReports(task.clientId)).then((action) => {
                  if (
                    Array.isArray(action.payload) &&
                    action.payload.filter(cr => cr.id === task.reportId).length
                  ) {
                    setTask({ type: TaskTypes.OpenClient, target: task.clientId });
                  }
                }, () => {});
              }
            }, () => {});
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
    }
  }, [isLoading, task, reports, projects, orphanReports, orphanProjects, clients]);

  const handleSearch = useCallback(async (value, targets) => {
    setIsSearching(!!value.length);
    let promises = [], shouldGetData = false;
    let hasProjects = false, hasReports = 0;
    let filters = { query: value };
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      filters[target.key] = target.value;
      if (target.value) {
        if (target.key === SearchTargets.Projects) {
          hasProjects = true;
          shouldGetData = true;
        } else if (target.key === SearchTargets.Reports) {
          hasReports = true;
          shouldGetData = true;
        }
      }
    }
    setSearchFilters(filters);
    setClientsSearch(!shouldGetData);
    setProjectsSearch(hasProjects && !hasReports);
    if (!isLoadedSearchData && shouldGetData && value.length) {
      promises.push(dispatch(getProjects()).then(() => {}, () => {}));
      promises.push(dispatch(getReports()).then(() => {}, () => {}));
    }
    await Promise.all(promises).then((res) => {
      shouldGetData && setIsLoadedSearchData(true);
      return res;
    });
  }, [isLoadedSearchData]);

  const filterStack = useCallback((stack, filter, values, key) => {
    filter = filter ? filter.toLowerCase() : null;
    return stack.filter(item => (
      (filter && item.name.toLowerCase().includes(filter)) ||
      (values || []).indexOf(item[key || 'id']) > -1
    ));
  });

  useEffect(() => {
    if (isSearching && isLoadedSearchData && searchFilters.query.length) {
      let clientsResult = [];
      let projectsResult = [], orphanProjectsResult = [];
      let reportsResult = [], orphanReportsResult = [], clientReportsResult = [];
      let opIds = {}, orIds = {}, crIds = {};
      let pendingClients = {}, pendingProjects = {};
      let pushedReports = {}, pushedProjects = {};
      orphanProjects.forEach(p => (opIds[p.id] = true));
      orphanReports.forEach(r => (orIds[r.id] = true));
      clientReports.forEach(r => (crIds[r.id] = true));
      const pushReport = (r) => {
        if (!pushedReports[r.id]) {
          pushedReports[r.id] = true;
          if (orIds.hasOwnProperty(r.id)) {
            orphanReportsResult.push(r);
          } else if (crIds.hasOwnProperty(r.id)) {
            clientReportsResult.push(r);
          } else {
            reportsResult.push(r);
          }
        }
      };
      const pushProject = (p) => {
        if (!pushedProjects[p.id]) {
          pushedProjects[p.id] = true;
          if (opIds.hasOwnProperty(p.id)) {
            orphanProjectsResult.push(p);
          } else {
            projectsResult.push(p);
          }
          initReportCreationRights(p.id);
        }
      };
      if (searchFilters[SearchTargets.Reports]) {
        filterStack(reports, searchFilters.query).forEach(r => {
          pendingProjects[r.project_id] = true;
          pushReport(r);
        });
      }
      if (searchFilters[SearchTargets.Projects] || Object.keys(pendingProjects).length) {
        const fromFilter = searchFilters[SearchTargets.Projects];
        const query = fromFilter ? searchFilters.query : null;
        const pendingIds = Object.keys(pendingProjects).map(id => +id);
        let ids = {};
        filterStack(projects, query, pendingIds).forEach(p => {
          ids[p.id] = true;
          pendingClients[p.domain_id] = true;
          pushProject(p);
        });
        if (fromFilter) {
          ids = Object.keys(ids).map(id => +id);
          filterStack(reports, null, ids, 'project_id').forEach(r => {
            pushReport(r);
          });
        }
      }
      if (searchFilters[SearchTargets.Clients] || Object.keys(pendingClients).length) {
        const fromFilter = searchFilters[SearchTargets.Clients];
        const query = fromFilter ? searchFilters.query : null;
        const pendingIds = Object.keys(pendingClients).map(id => +id);
        let ids = {}, pids = {};
        filterStack(clients, query, pendingIds).forEach(c => {
          ids[c.id] = true;
          clientsResult.push(c);
          initProjectCreationRights(c.id, projects.filter(p => p.domain_id === c.id));
        });
        if (fromFilter) {
          ids = Object.keys(ids).map(id => +id);
          filterStack(projects, null, ids, 'domain_id').forEach(p => {
            pids[p.id] = true;
            pushProject(p);
          });
          pids = Object.keys(pids).map(id => +id);
          filterStack(reports, null, pids, 'project_id').forEach(r => {
            pushReport(r);
          });
        }
      }
      setFilteredClients(clientsResult);
      setFilteredProjects(projectsResult);
      setFilteredOrphanProjects(orphanProjectsResult);
      setFilteredReports(reportsResult);
      setFilteredOrphanReports(orphanReportsResult);
      setFilteredClientReports(clientReportsResult);
    }
  }, [
    isSearching, isLoadedSearchData, searchFilters,
    clients, projects, orphanProjects, reports, orphanReports, clientReports,
  ]);

  const decorateSearchResults = useCallback(() => {
    if (filteredClients.length) {
      let states = {}, state = !clientsSearch;
      filteredClients.forEach(c => {
        states[c.id] = state || (c.id === activeClient);
      });
      setOpenClients(states);
      if (state) {
        setLoadedClients(states);
      }
    }
    if (filteredProjects.length || filteredOrphanProjects.length) {
      let states = {}, state = !clientsSearch && !projectsSearch;
      const pushProject = p => {
        states[p.id] = state || (p.id === activeProject);
      };
      filteredProjects.forEach(p => pushProject(p));
      filteredOrphanProjects.forEach(p => pushProject(p));
      setOpenProjects(states);
      if (state) {
        setLoadedProjects(states);
      }
    }
  }, [
    clientsSearch, projectsSearch, openClients, openProjects,
    filteredClients, filteredProjects, filteredOrphanProjects,
  ]);

  useEffect(() => {
    if (isSearching) {
      decorateSearchResults();
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
    } else if (statesBackup) {
      setOpenClients(statesBackup.clients.open);
      setLoadedClients(statesBackup.clients.loaded);
      setOpenProjects(statesBackup.projects.open);
      setLoadedProjects(statesBackup.projects.loaded);
      setStatesBackup(null);
    }
  }, [isSearching, isLoadedSearchData]);

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search
          placeholder="Search"
          targets={searchComponentTargets}
          hasShadows={true}
          onSearch={handleSearch}
        />
      </div>
      {((isLoading || (isSearching && !clientsSearch && !isLoadedSearchData)) && (
        <Loader inline className={styles.loader} />
      ))
      || (isSearching && !filteredClients.length && (
        <div className={styles.noResults}>No results</div>
      ))
      || (
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
                clientReports={(isSearching ? filteredClientReports : clientReports)
                  .filter(cr => cr.project.domain_id === client.id)}
                open={!!openClients[client.id]}
                loaded={!!loadedClients[client.id]}
                active={activeClient === client.id}
                activeProject={activeProject}
                activeReport={activeReport}
                isActiveAddLink={isActiveAddLink}
                canCreateProjects={canCreateProjects}
                canCreateReports={canCreateReports}
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
                orphan={true}
                activeReport={activeReport}
                isActiveAddLink={isActiveAddLink}
                canCreateReports={canCreateReports}
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
                orphan={true}
              />
            ))
          )}
        </>
      )}
      {isSuperUser(userId) && (
        <div className={styles.add}>
          <ClientAdd />
        </div>
      )}
    </div>
  );
};

export default SideMenu;
