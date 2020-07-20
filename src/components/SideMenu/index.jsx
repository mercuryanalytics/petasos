import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styles from './index.module.css';
import Routes from '../../utils/routes';
import { getClients } from '../../store/clients/actions';
import { sortClients } from '../../store/clients/reducers';
import { getProject, getProjects, getOrphanProjects } from '../../store/projects/actions';
import { sortProjects } from '../../store/projects/reducers';
import { getReport, getReports, getOrphanReports, getClientReports } from '../../store/reports/actions';
import { sortReports } from '../../store/reports/reducers';
import Search from '../common/Search';
import Loader from '../common/Loader';
import Tooltip from '../common/Tooltip';
import Client from './Client';
import ClientAdd from './ClientAdd';
import Project from './Project';
import Report from './Report';
import Scrollable from '../common/Scrollable';
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

const SearchToggles = {
  HideClients: 'hide-clients',
};

const searchComponentTargets = [
  { key: SearchTargets.Clients, label: 'Clients', value: true },
  { key: SearchTargets.Projects, label: 'Projects', value: true },
  { key: SearchTargets.Reports, label: 'Reports', value: true },
];

const searchComponentToggles = [
  { key: SearchToggles.HideClients, text: 'Hide clients', value: false },
];

const SideMenu = props => {
  const { userId } = props;
  const history = useHistory();
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
  const [awaitRoute, setAwaitRoute] = useState(null);
  const [openClients, setOpenClients] = useState({});
  const [loadedClients, setLoadedClients] = useState({});
  const [openProjects, setOpenProjects] = useState({});
  const [loadedProjects, setLoadedProjects] = useState({});
  const [canCreateProjects, setCanCreateProjects] = useState({});
  const [canCreateReports, setCanCreateReports] = useState({});
  const [clientsVisibility, setClientsVisibility] = useState(true);
  const [isLoadedProjectsData, setIsLoadedProjectsData] = useState(false);
  const [isLoadingProjectsData, setIsLoadingProjectsData] = useState(false);
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
  const [isLoadingSearchData, setIsLoadingSearchData] = useState(false);
  const [statesBackup, setStatesBackup] = useState(null);
  const [filteredClients, setFilteredClients] = useState({});
  const [filteredProjects, setFilteredProjects] = useState({});
  const [filteredReports, setFilteredReports] = useState({});

  const init = useCallback((status) => {
    const handleSuccess = (isEmptyState) => {
      if (props.onLoad) {
        props.onLoad(isEmptyState);
      }
      setIsLoading(false);
    };
    if (status === true || status === false) {
      handleSuccess(status);
      return;
    }
    setIsLoading(true);
    let defaultRoutes = {};
    Promise.all([
      dispatch(getClients()).then((action) => {
        if (action.payload.length) {
          const sortedClients = sortClients(action.payload);
          defaultRoutes.client = Routes.ManageClient.replace(':id', sortedClients[0].id);
        }
      }, () => {}),
      dispatch(getOrphanProjects()).then((action) => {
        if (action.payload.length) {
          const sortedProjects = sortProjects(action.payload);
          defaultRoutes.project = Routes.ManageProject.replace(':id', sortedProjects[0].id);
        }
      }, () => {}),
      dispatch(getOrphanReports()).then((action) => {
        if (action.payload.length) {
          const sortedReports = sortReports(action.payload);
          defaultRoutes.report = Routes.ManageReport.replace(':id', sortedReports[0].id);
        }
      }, () => {}),
    ]).then(() => {
      const noActiveRes = !activeClient && !activeProject && !activeReport;
      const defaultRoute = defaultRoutes.client || defaultRoutes.project || defaultRoutes.report;
      if (props.autoselect && noActiveRes && !isActiveAddLink && defaultRoute) {
        setAwaitRoute(defaultRoute);
        history.push(defaultRoute);
      } else {
        handleSuccess(!defaultRoute);
      }
    });
  }, [props, activeClient, activeProject, activeReport, isActiveAddLink, dispatch, history]);

  useEffect(init, []);

  useEffect(() => {
    if (awaitRoute && awaitRoute === history.location.pathname) {
      init(false);
      setAwaitRoute(null);
    }
  // eslint-disable-next-line
  }, [awaitRoute, history.location.pathname]);

  const initProjectCreationRights = useCallback((clientId, clientProjects) => {
    let canCreate = false;
    if (clientProjects.length) {
      for (let i = 0; i < clientProjects.length; i++) {
        if (hasRoleOnProject(userId, clientProjects[i].id, UserRoles.ProjectManager)) {
          canCreate = true;
          break;
        }
      }
    } else {
      canCreate = isSuperUser(userId);
    }
    setCanCreateProjects(prev => ({ ...prev, [clientId]: canCreate }));
  }, [userId]);

  const initReportCreationRights = useCallback((projectId) => {
    let canCreate = hasRoleOnProject(userId, projectId, UserRoles.ProjectManager);
    setCanCreateReports(prev => ({ ...prev, [projectId]: canCreate }));
  }, [userId]);

  const handleClientOpen = useCallback(async (client, onReady) => {
    onReady = onReady ? onReady : () => {};
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
        onReady();
      });
    } else {
      onReady();
    }
  }, [openClients, loadedClients, dispatch, initProjectCreationRights]);

  const handleClientClose = useCallback((client) => {
    if (openClients[client.id]) {
      setOpenClients(prev => ({ ...prev, [client.id]: false }));
    }
  }, [openClients]);

  const handleProjectOpen = useCallback(async (project, onReady) => {
    onReady = onReady ? onReady : () => {};
    if (!openProjects[project.id]) {
      setOpenProjects(prev => ({ ...prev, [project.id]: true }));
    }
    if (!loadedProjects[project.id]) {
      await dispatch(getReports(project.id)).then(() => {
        initReportCreationRights(project.id);
        setLoadedProjects(prev => ({ ...prev, [project.id]: true }));
        onReady();
      }, () => {});
    } else {
      onReady();
    }
  }, [openProjects, loadedProjects, dispatch, initReportCreationRights]);

  const handleProjectClose = useCallback((project) => {
    if (openProjects[project.id]) {
      setOpenProjects(prev => ({ ...prev, [project.id]: false }));
    }
  }, [openProjects]);

  const scrollToActive = useCallback(() => {
    let type, id;
    if (activeReport) {
      type = 'report';
      id = activeReport;
    } else if (activeProject) {
      type = 'project';
      id = activeProject;
    } else if (activeClient) {
      type = 'client';
      id = activeClient;
    }
    if (type && id) {
      setTimeout(() => {
        let el = window.document.getElementById(`sidemenu-${type}-${id}`);
        if (el) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 0);
    }
  }, [activeClient, activeProject, activeReport]);

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
      // eslint-disable-next-line
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
            handleProjectOpen(p, () => setTask({
              type: TaskTypes.OpenClient,
              target: p.domain_id,
            }));
          } else {
            dispatch(getProject(task.target)).then(() => {}, () => {
              if (task.clientId && clients.filter(c => c.id === task.clientId)[0]) {
                handleClientOpen({ id: task.clientId }, scrollToActive);
              } else {
                scrollToActive();
              }
            });
          }
          break;
        case TaskTypes.OpenClient:
          let c = clients.filter(c => c.id === task.target)[0];
          if (c) {
            handleClientOpen(c, scrollToActive);
          } else {
            scrollToActive();
          }
          setTask(null);
          break;
      }
    }
  }, [
    isLoading, task, reports, projects, orphanReports, orphanProjects, clients,
    dispatch, handleClientOpen, handleProjectOpen, scrollToActive,
  ]);

  const filterStack = useCallback((stack, filter, values, key) => {
    filter = filter ? filter.toLowerCase() : null;
    return stack.filter(item => (
      (filter && item.name.toLowerCase().includes(filter)) ||
      (filter && item.project_number && item.project_number.toLowerCase().includes(filter)) ||
      (values || []).indexOf(item[key || 'id']) > -1
    ));
  }, []);

  const updateSearchResults = useCallback(() => {
    const isReportsSearch = !!searchFilters[SearchTargets.Reports];
    const isProjectsSearch = !!searchFilters[SearchTargets.Projects];
    const isClientsSearch = !!searchFilters[SearchTargets.Clients];
    const shouldOpenClients = !clientsSearch;
    const shouldOpenProjects = !clientsSearch && !projectsSearch;
    let cids = {}, pids = {}, rids = {};
    let matchedClients = {}, matchedProjects = {};
    let newClientStates = {}, newProjectStates = {};
    if (isReportsSearch) {
      filterStack(reports, searchFilters.query).forEach(r => {
        rids[r.id] = true;
        pids[r.project_id] = true;
        cids[r.project.domain_id] = true;
      });
    }
    if (isProjectsSearch) {
      filterStack(projects, searchFilters.query).forEach(p => {
        matchedProjects[p.id] = true;
        pids[p.id] = true;
        cids[p.domain_id] = true;
      });
    }
    if (isClientsSearch) {
      filterStack(clients, searchFilters.query).forEach(c => {
        matchedClients[c.id] = true;
        cids[c.id] = true;
      });
      if (Object.keys(matchedClients).length) {
        projects.filter(p => !!matchedClients[p.domain_id]).forEach(p => {
          matchedProjects[p.id] = true;
          pids[p.id] = true;
        });
      }
    }
    if (Object.keys(matchedProjects).length) {
      reports.filter(r => !!matchedProjects[r.project_id]).forEach(r => {
        rids[r.id] = true;
      });
    }
    Object.keys(cids).map(i => +i).forEach(id => {
      newClientStates[id] = shouldOpenClients || (id === activeClient);
      initProjectCreationRights(id, projects.filter(p => p.domain_id === id));
    });
    Object.keys(pids).map(i => +i).forEach(id => {
      newProjectStates[id] = shouldOpenProjects || (id === activeProject);
      initReportCreationRights(id);
    });
    if (shouldOpenClients) {
      setLoadedClients(newClientStates);
    }
    if (shouldOpenProjects) {
      setLoadedProjects(newProjectStates);
    }
    setFilteredClients(cids);
    setFilteredProjects(pids);
    setFilteredReports(rids);
    setOpenClients(newClientStates);
    setOpenProjects(newProjectStates);
  }, [
    searchFilters, filterStack, clients, projects, reports,
    initProjectCreationRights, initReportCreationRights,
    clientsSearch, projectsSearch, activeClient, activeProject,
  ]);

  useEffect(() => {
    if (isSearching && isLoadedSearchData && !!searchFilters.query.length) {
      updateSearchResults();
    } else if (!isSearching) {
      scrollToActive();
    }
  // eslint-disable-next-line
  }, [isSearching, isLoadedSearchData, searchFilters]);

  const handleSearch = useCallback(async (value, targets) => {
    setIsSearching(!!value.length);
    if (!value.length) {
      if (statesBackup) {
        setOpenClients(statesBackup.clients.open);
        setLoadedClients(statesBackup.clients.loaded);
        setOpenProjects(statesBackup.projects.open);
        setLoadedProjects(statesBackup.projects.loaded);
        setStatesBackup(null);
      }
      return;
    }
    if (!statesBackup) {
      setStatesBackup({
        clients: { open: { ...openClients }, loaded: { ...loadedClients } },
        projects: { open: { ...openProjects }, loaded: { ...loadedProjects } },
      });
    }
    let filters = { query: value };
    let hasClients = false, hasProjects = false, hasReports = false;
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      filters[target.key] = target.value;
      if (target.value) {
        if (target.key === SearchTargets.Clients) {
          hasClients = true;
        } else if (target.key === SearchTargets.Projects) {
          hasProjects = true;
        } else if (target.key === SearchTargets.Reports) {
          hasReports = true;
        }
      }
    }
    setSearchFilters(filters);
    setClientsSearch(!hasProjects && !hasReports);
    setProjectsSearch(hasProjects && !hasReports);
    if (!isLoadedSearchData && !isLoadingSearchData && (hasProjects || hasReports)) {
      setIsLoadingSearchData(true);
      let promises = [];
      promises.push(dispatch(getProjects()).then(() => {}, () => {}));
      promises.push(dispatch(getReports()).then(() => {}, () => {}));
      await Promise.all(promises).then(() => {
        updateSearchResults();
        if (hasClients || hasProjects || hasReports) {
          setIsLoadingSearchData(false);
          setIsLoadedSearchData(true);
        }
      });
    }
  }, [
    isLoadedSearchData, isLoadingSearchData, statesBackup, updateSearchResults,
    openClients, loadedClients, openProjects, loadedProjects, dispatch,
  ]);

  const handleSearchToggleChange = useCallback(async (key, status) => {
    if (key === SearchToggles.HideClients) {
      setClientsVisibility(!status);
      if (status && !isLoadedProjectsData && !isLoadingProjectsData) {
        setIsLoadingProjectsData(true);
        await Promise.all([
          dispatch(getProjects()).then(() => {}, () => {}),
          dispatch(getOrphanProjects()).then(() => {}, () => {}),
          dispatch(getOrphanReports()).then(() => {}, () => {}),
        ]).then(() => {
          setIsLoadingProjectsData(false);
          setIsLoadedProjectsData(true);
        });
      }
    }
  }, [isLoadedProjectsData, isLoadingProjectsData, dispatch]);

  return (
    <div className={styles.container}>
      {!isLoading && (
        (clients && !!clients.length) ||
        (orphanProjects && !!orphanProjects.length) ||
        (orphanReports && !!orphanReports.length)
      ) && (
        <div className={styles.search}>
          <Search
            id="sidemenu-search"
            placeholder="Search"
            targets={searchComponentTargets}
            toggles={searchComponentToggles}
            hasShadows={true}
            onSearch={handleSearch}
            onToggleChange={handleSearchToggleChange}
          />
        </div>
      )}
      <Scrollable className={styles.menu}>
        {((!isLoading && (
          (isSearching && !clientsSearch && !isLoadedSearchData) ||
          (!clientsVisibility && !isLoadedProjectsData)
        )) && (
          <Loader inline className={styles.loader} />
        ))
        || (isSearching && !Object.keys(filteredClients).length && (
          <div className={styles.noResults}></div>
        ))
        || (!isLoading && !clientsVisibility && (
          projects.map(project => (
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
              isSearching={isSearching}
              filteredProjects={filteredProjects}
              filteredReports={filteredReports}
              onOpen={handleProjectOpen}
              onClose={handleProjectClose}
            />
          ))
        ))
        || (!isLoading && (<>
          {clients && !!clients.length && (
            clients.map(client => (
              <Client
                key={`client-btn-${client.id}`}
                data={client}
                projects={projects.filter(p => p.domain_id === client.id)}
                openProjects={openProjects}
                loadedProjects={loadedProjects}
                reports={reports}
                clientReports={clientReports.filter(cr => cr.project.domain_id === client.id)}
                open={!!openClients[client.id]}
                loaded={!!loadedClients[client.id]}
                active={activeClient === client.id}
                activeProject={activeProject}
                activeReport={activeReport}
                isActiveAddLink={isActiveAddLink}
                canCreateProjects={canCreateProjects}
                canCreateReports={canCreateReports}
                isSearching={isSearching}
                filteredClients={filteredClients}
                filteredProjects={filteredProjects}
                filteredReports={filteredReports}
                onOpen={handleClientOpen}
                onClose={handleClientClose}
                onProjectOpen={handleProjectOpen}
                onProjectClose={handleProjectClose}
              />
            ))
          )}
          {!!clients.length && (
            (orphanProjects && !!orphanProjects.length) ||
            (orphanReports && !!orphanReports.length)
          ) && (
            <div className={styles.orphansSeparator}>
              <Tooltip id="other-reports-tt" location="top" zIndex={5}>
                <span>Reports for which the parent client is unknown.</span>
              </Tooltip>
              <span>Other reports</span>
            </div>
          )}
          {orphanProjects && !!orphanProjects.length && (
            orphanProjects.map(project => (
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
                isSearching={isSearching}
                filteredProjects={filteredProjects}
                filteredReports={filteredReports}
                onOpen={handleProjectOpen}
                onClose={handleProjectClose}
              />
            ))
          )}
          {orphanReports && !!orphanReports.length && (
            orphanReports.map(report => (
              <Report
                key={`report-btn-${report.id}`}
                data={report}
                active={activeReport === report.id}
                orphan={true}
                isSearching={isSearching}
                filteredReports={filteredReports}
              />
            ))
          )}
        </>))}
        {!isLoading && clientsVisibility && isSuperUser(userId) && (
          <div className={styles.add}>
            <ClientAdd />
          </div>
        )}
      </Scrollable>
    </div>
  );
};

export default SideMenu;
