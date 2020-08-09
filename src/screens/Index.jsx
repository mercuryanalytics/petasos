import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Index.module.css';
import Routes from '../utils/routes';
import { setLocationData } from '../store/location/actions';
import Screen from './Screen';
import PageNotFound from './PageNotFound';
import AccessRestricted from './AccessRestricted';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ClientManage from '../components/ClientManage';
import ProjectManage from '../components/ProjectManage';
import ReportManage from '../components/ReportManage';
import { getClient } from '../store/clients/actions';
import { getProject } from '../store/projects/actions';
import { getReport } from '../store/reports/actions';
import { UserRoles, isSuperUser, hasRoleOnClient, hasRoleOnProject, hasRoleOnReport } from '../store';

export const ContentTypes = {
  CreateClient: 'create-client',
  ManageClient: 'manage-client',
  CreateProject: 'create-project',
  ManageProject: 'manage-project',
  CreateReport: 'create-report',
  ManageReport: 'manage-report',
};

const Index = props => {
  const { content } = props;
  const params = props.match.params;
  const resId = +params.id;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isDataMissing, setIsDataMissing] = useState(false);
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [clientBreadcrumbs, setClientBreadcrumbs] = useState(null);
  const clients = useSelector(state => state.clientsReducer.clients);
  const projects = useSelector(state => state.projectsReducer.projects);
  const reports = useSelector(state => state.reportsReducer.reports);

  useEffect(() => {
    // eslint-disable-next-line
    switch (content) {
      case ContentTypes.CreateClient:
        dispatch(setLocationData({ client: false, create: true }));
        break;
      case ContentTypes.ManageClient:
        dispatch(setLocationData({ client: resId }));
        break;
      case ContentTypes.CreateProject:
        dispatch(setLocationData({ client: +params.clientId, create: true }));
        break;
      case ContentTypes.ManageProject:
        dispatch(setLocationData({ project: resId }));
        break;
      case ContentTypes.CreateReport:
        dispatch(setLocationData({ project: +params.projectId, create: true }));
        break;
      case ContentTypes.ManageReport:
        dispatch(setLocationData({ report: resId }));
        break;
    }
    if (content !== ContentTypes.ManageClient) {
      setClientBreadcrumbs(null);
    }
  // eslint-disable-next-line
  }, [content, params]);

  const getCurrentReport = useCallback(() => {
    let id, result;
    if (content === ContentTypes.ManageReport) {
      id = resId;
    }
    if (id) {
      result = reports.filter(r => r.id === id)[0];
    }
    return result ? result : null;
  }, [content, resId, reports]);

  const getCurrentProject = useCallback(() => {
    let id, result;
    if (content === ContentTypes.ManageProject) {
      id = resId;
    } else if (content === ContentTypes.CreateReport) {
      id = +params.projectId;
    } else {
      const report = getCurrentReport();
      if (report) {
        id = report.project_id;
      }
    }
    if (id) {
      result = projects.filter(p => p.id === id)[0];
    }
    return result ? result : null;
  }, [content, resId, params, projects, getCurrentReport]);

  const getCurrentClient = useCallback(() => {
    let id, result;
    if (content === ContentTypes.ManageClient) {
      id = resId;
    } else if (content === ContentTypes.CreateProject) {
      id = +params.clientId;
    } else {
      const project = getCurrentProject();
      if (project) {
        id = project.domain_id;
      } else {
        const report = getCurrentReport();
        if (report) {
          id = report.project.domain_id;
        }
      }
    }
    if (id) {
      result = clients.filter(c => c.id === id)[0];
    }
    return result ? result : null;
  }, [content, resId, params, clients, getCurrentReport, getCurrentProject]);

  const checkAuthorizations = useCallback((user, data) => {
    // eslint-disable-next-line
    switch (content) {
      case ContentTypes.CreateClient:
        setIsAccessBlocked(!isSuperUser(user.id));
        break;
      case ContentTypes.ManageClient:
        setIsAccessBlocked(!hasRoleOnClient(user.id, resId, UserRoles.Viewer));
        break;
      case ContentTypes.CreateProject:
        setIsAccessBlocked(!hasRoleOnClient(user.id, +params.clientId, UserRoles.ClientAdmin));
        break;
      case ContentTypes.ManageProject:
        setIsAccessBlocked(!hasRoleOnProject(user.id, resId, UserRoles.Viewer));
        break;
      case ContentTypes.CreateReport:
        setIsAccessBlocked(
          !hasRoleOnProject(user.id, +params.projectId, UserRoles.ProjectAdmin) &&
          !hasRoleOnClient(user.id, data.client.id, UserRoles.ClientAdmin)
        );
        break;
      case ContentTypes.ManageReport:
        setIsAccessBlocked(!hasRoleOnReport(user.id, resId, UserRoles.Viewer));
        break;
    }
  }, [content, resId, params]);

  const handleScreenLoad = useCallback((user) => {
    let client = getCurrentClient();
    let project = getCurrentProject();
    let report = getCurrentReport();
    let promises = [], bc = [], dataError;
    // eslint-disable-next-line
    switch (content) {
      case ContentTypes.CreateClient:
        bc.push('Create client');
        break;
      case ContentTypes.ManageClient:
        !client && promises.push(dispatch(getClient(resId)).then(
          (action) => (client = action.payload),
          (error) => (dataError = error),
        ));
        break;
      case ContentTypes.CreateProject:
        bc.push('Create project');
        !client && promises.push(dispatch(getClient(+params.clientId)).then(
          (action) => (client = action.payload),
          (error) => (dataError = error),
        ));
        break;
      case ContentTypes.ManageProject:
        !project && promises.push(dispatch(getProject(resId)).then(
          async (action) => {
            project = action.payload;
            return await dispatch(getClient(project.domain_id)).then(
              (action) => (client = action.payload),
              (error) => (dataError = error),
            );
          },
          (error) => (dataError = error),
        ));
        break;
      case ContentTypes.CreateReport:
        bc.push('Create report');
        !project && promises.push(dispatch(getProject(+params.projectId)).then(
          async (action) => {
            project = action.payload;
            return await dispatch(getClient(project.domain_id)).then(
              (action) => (client = action.payload),
              (error) => (dataError = error),
            );
          },
          (error) => (dataError = error),
        ));
        break;
      case ContentTypes.ManageReport:
        !report && promises.push(dispatch(getReport(resId)).then(async (action) => {
          report = action.payload;
          return await Promise.all([
            dispatch(getProject(report.project_id)).then(
              (action) => (project = action.payload),
              (error) => (dataError = error),
            ),
            dispatch(getClient(report.project.domain_id)).then(
              (action) => (client = action.payload),
              (error) => (dataError = error),
            ),
          ]);
        }, () => {}));
        break;
    }
    Promise.all(promises).then(() => {
      if (dataError) {
        if (dataError.xhrHttpCode === 404) {
          setBreadcrumbs([]);
          setIsDataMissing(true);
          setIsLoading(false);
          return;
        }
      }
      let finalBc = [];
      if (client && client.name) {
        finalBc.push({
          text: client.name,
          link: Routes.ManageClient.replace(':id', client.id),
        });
      }
      if (project && project.name) {
        finalBc.push({
          text: project.name,
          link: Routes.ManageProject.replace(':id', project.id),
        });
      }
      if (report && report.name) {
        finalBc.push({
          text: report.name,
          link: Routes.ManageReport.replace(':id', report.id),
        });
      }
      finalBc = finalBc.concat(bc);
      setBreadcrumbs(finalBc);
      checkAuthorizations(user, { client });
      setIsLoading(false);
    });
  }, [
    content, resId, params, checkAuthorizations, dispatch,
    getCurrentClient, getCurrentProject, getCurrentReport,
  ]);

  return (!isAccessBlocked && !isDataMissing) ? (
    <Screen
      className={styles.container}
      private
      useEmptyState={true}
      keepLoading={isLoading}
      onLoad={handleScreenLoad}
    >
      <div className={styles.breadcrumbs}>
        <Breadcrumbs data={[ ...breadcrumbs, ...(clientBreadcrumbs || []) ]} />
      </div>
      <div className={styles.content}>
        {(content === ContentTypes.CreateClient && <ClientManage />) ||
        (content === ContentTypes.ManageClient && (
          <ClientManage id={resId} onBreadcrumbsChange={bc => setClientBreadcrumbs(bc)} />
        )) ||
        (content === ContentTypes.CreateProject && <ProjectManage clientId={+params.clientId} />) ||
        (content === ContentTypes.ManageProject && <ProjectManage id={resId} />) ||
        (content === ContentTypes.CreateReport && <ReportManage projectId={+params.projectId} />) ||
        (content === ContentTypes.ManageReport && <ReportManage id={resId} />)}
      </div>
    </Screen>
  ) : (
    (isDataMissing && <PageNotFound />) ||
    (isAccessBlocked && <AccessRestricted />)
  );
};

export default Index;
