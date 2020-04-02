import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Index.module.css';
import { setLocationData } from '../store/location/actions';
import Screen from './Screen';
import Breadcrumbs from '../components/Breadcrumbs';
import ClientManage from '../components/ClientManage';
import ProjectManage from '../components/ProjectManage';
import ReportManage from '../components/ReportManage';

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
  const [loaded, setLoaded] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const report = useSelector(state =>
    reportId !== null ? state.reportsReducer.reports.filter(r => r.id === reportId)[0] : null);
  const project = useSelector(state => {
    const id = projectId !== null ? projectId : (report ? report.project_id : null);
    return id !== null ? state.projectsReducer.projects.filter(r => r.id === id)[0] : null;
  });
  const client = useSelector(state => {
    const id = clientId !== null ? clientId : (project ? project.domain_id : null);
    return id !== null ? state.clientsReducer.clients.filter(c => c.id === id)[0] : null;
  });

  useEffect(() => {
    if (loaded) {
      let newClientId = null;
      let newProjectId = null;
      let newReportId = null;
      switch (content) {
        case ContentTypes.ManageClient:
          dispatch(setLocationData({ client: resId }));
          newClientId = resId;
          break;
        case ContentTypes.CreateProject:
          dispatch(setLocationData({ client: +params.clientId, create: true }));
          newClientId = +params.clientId;
          break;
        case ContentTypes.ManageProject:
          dispatch(setLocationData({ project: resId }));
          newProjectId = resId;
          break;
        case ContentTypes.CreateReport:
          dispatch(setLocationData({ project: +params.projectId, create: true }));
          newProjectId = +params.projectId;
          break;
        case ContentTypes.ManageReport:
          dispatch(setLocationData({ report: resId }));
          newReportId = resId;
          break;
      }
      setClientId(newClientId);
      setProjectId(newProjectId);
      setReportId(newReportId);
    }
  }, [content, loaded, params]);

  useEffect(() => {
    switch (content) {
      case ContentTypes.CreateClient:
        setBreadcrumbs(['Create client']);
        break;
      case ContentTypes.ManageClient:
        if (client) {
          setBreadcrumbs([client.name]);
        }
        break;
      case ContentTypes.CreateProject:
        if (client) {
          setBreadcrumbs([client.name, 'Create project']);
        }
        break;
      case ContentTypes.ManageProject:
        if (client && project) {
          setBreadcrumbs([client.name, project.name]);
        }
        break;
      case ContentTypes.CreateReport:
        if (client && project) {
          setBreadcrumbs([client.name, project.name, 'Create report']);
        }
        break;
      case ContentTypes.ManageReport:
        if (client && project && report) {
          setBreadcrumbs([client.name, project.name, report.name]);
        }
        break;
      default:
        setBreadcrumbs([]);
    }
  }, [content, client, project, report]);

  return (
    <Screen className={styles.container} private onLoad={() => setLoaded(true)}>
      <div className={styles.header}>
        <Breadcrumbs data={breadcrumbs} />
      </div>
      {(content === ContentTypes.CreateClient && <ClientManage />) ||
      (content === ContentTypes.ManageClient && <ClientManage id={resId} />) ||
      (content === ContentTypes.CreateProject && <ProjectManage clientId={params.clientId} />) ||
      (content === ContentTypes.ManageProject && <ProjectManage id={resId} />) ||
      (content === ContentTypes.CreateReport && <ReportManage projectId={params.projectId} />) ||
      (content === ContentTypes.ManageReport && <ReportManage id={resId} />)}
    </Screen>
  );
};

export default Index;
