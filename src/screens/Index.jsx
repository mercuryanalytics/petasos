import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Index.module.css';
import { setLocationData } from '../store/location/actions';
import Screen from './Screen';
import AccessRestricted from './AccessRestricted';
import Breadcrumbs from '../components/Breadcrumbs';
import ClientManage from '../components/ClientManage';
import ProjectManage from '../components/ProjectManage';
import ReportManage from '../components/ReportManage';
import { UserRoles, hasRoleOnClient, hasRoleOnProject, hasRoleOnReport } from '../store';

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
  const [user, setUser] = useState(null);
  const [accessOptions, setAccessOptions] = useState(null);
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [clientBreadcrumbs, setClientBreadcrumbs] = useState(null);
  const report = useSelector(state => accessOptions && accessOptions.reportId ?
    (state.reportsReducer.reports.filter(r => r.id === accessOptions.reportId)[0] || null) : null);
  const project = useSelector(state => accessOptions && accessOptions.projectId ?
    (state.projectsReducer.projects.filter(p => p.id === accessOptions.projectId)[0] || null) :
      (!!report ? (state.projectsReducer.projects.filter(p => p.id === report.project_id)[0] || null) : null));
  const client = useSelector(state => accessOptions && accessOptions.clientId ?
    (state.clientsReducer.clients.filter(c => c.id === accessOptions.clientId)[0] || null) :
      (!!project ? (state.clientsReducer.clients.filter(c => c.id === project.domain_id)[0] || null) : null));

  useEffect(() => {
    setAccessOptions(null);
    switch (content) {
      case ContentTypes.ManageClient:
        setAccessOptions({ clientId: resId });
        dispatch(setLocationData({ client: resId }));
        break;
      case ContentTypes.CreateProject:
        dispatch(setLocationData({ client: +params.clientId, create: true }));
        break;
      case ContentTypes.ManageProject:
        setAccessOptions({ projectId: resId });
        dispatch(setLocationData({ project: resId }));
        break;
      case ContentTypes.CreateReport:
        dispatch(setLocationData({ project: +params.projectId, create: true }));
        break;
      case ContentTypes.ManageReport:
        setAccessOptions({ reportId: resId });
        dispatch(setLocationData({ report: resId }));
        break;
    }
  }, [content, params]);

  useEffect(() => {
    let bc = [];
    switch (content) {
      case ContentTypes.CreateClient:
        bc.push('Create client');
        break;
      case ContentTypes.ManageClient:
        client && bc.push(client.name);
        clientBreadcrumbs && (bc = bc.concat(clientBreadcrumbs));
        break;
      case ContentTypes.CreateProject:
        client && bc.push(client.name);
        bc.push('Create project');
        break;
      case ContentTypes.ManageProject:
        client && bc.push(client.name);
        project && bc.push(project.name);
        break;
      case ContentTypes.CreateReport:
        client && bc.push(client.name);
        project && bc.push(project.name);
        bc.push('Create report');
        break;
      case ContentTypes.ManageReport:
        client && (bc.push(client.name));
        project && bc.push(project.name);
        report && bc.push(report.name);
        break;
    }
    if (content !== ContentTypes.ManageClient) {
      setClientBreadcrumbs(null);
    }
    setBreadcrumbs(bc);
  }, [content, client, project, report, clientBreadcrumbs]);

  const handleScreenLoad = useCallback((user) => {
    setUser(user);
    setIsLoading(false);
  }, []);

  const checkAuthorizations = useCallback(() => {
    switch (content) {
      case ContentTypes.ManageClient:
        setIsAccessBlocked(!hasRoleOnClient(user.id, resId, UserRoles.Viewer));
        break;
      case ContentTypes.ManageProject:
        setIsAccessBlocked(!hasRoleOnProject(user.id, resId, UserRoles.Viewer));
        break;
      case ContentTypes.ManageReport:
        setIsAccessBlocked(!hasRoleOnReport(user.id, resId, UserRoles.Viewer));
        break;
    }
  }, [user, content, resId, params]);

  useEffect(() => {
    if (!isLoading) {
      checkAuthorizations();
    }
  }, [content, resId, isLoading]);

  return !isAccessBlocked ? (
    <Screen className={styles.container} private onLoad={handleScreenLoad}>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs data={breadcrumbs} />
      </div>
      <div className={styles.content}>
        {(content === ContentTypes.CreateClient && <ClientManage />) ||
        (content === ContentTypes.ManageClient && (
          <ClientManage id={resId} onBreadcrumbsChange={bc => setClientBreadcrumbs(bc)} />
        )) ||
        (content === ContentTypes.CreateProject && <ProjectManage clientId={params.clientId} />) ||
        (content === ContentTypes.ManageProject && <ProjectManage id={resId} />) ||
        (content === ContentTypes.CreateReport && <ReportManage projectId={params.projectId} />) ||
        (content === ContentTypes.ManageReport && <ReportManage id={resId} />)}
      </div>
    </Screen>
  ) : (
    <AccessRestricted />
  );
};

export default Index;
