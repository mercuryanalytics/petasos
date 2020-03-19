import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Index.module.css';
import { setLocationData } from '../store/location/actions';
import { getClients, deleteClient } from '../store/clients/actions';
import { getProject, deleteProject } from '../store/projects/actions';
import { getReport, deleteReport } from '../store/reports/actions';
import Screen from './Screen';
import Loader from '../components/Loader';
import Breadcrumbs from '../components/Breadcrumbs';
import ClientManage from '../components/ClientManage';
import ProjectManage from '../components/ProjectManage';
import ReportManage from '../components/ReportManage';
import Button from '../components/Button';
import { MdDelete } from 'react-icons/md';

export const ContentTypes = {
  CreateClient: 'create-client',
  ManageClient: 'manage-client',
  CreateProject: 'create-project',
  ManageProject: 'manage-project',
  CreateReport: 'create-report',
  ManageReport: 'manage-report',
};

const LocationTitles = {
  [ContentTypes.CreateClient]: 'Create client',
  [ContentTypes.CreateProject]: 'Create project',
  [ContentTypes.CreateReport]: 'Create report',
};

const ContentTypesToDeleteActionText = {
  [ContentTypes.ManageClient]: 'Delete client',
  [ContentTypes.ManageProject]: 'Delete project',
  [ContentTypes.ManageReport]: 'Delete report',
};

const Index = props => {
  const { content } = props;
  const params = props.match.params;
  const resId = +params.id;
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const report = useSelector(state =>
    reportId !== null ? state.reportsReducer.reports.filter(r => r.id === reportId)[0] : null);
  const project = useSelector(state =>
    projectId !== null || report ?
      state.projectsReducer.projects.filter(p => p.id === (report ? report.project_id : projectId))[0]
      : null);
  const clients = useSelector(state => state.clientsReducer.clients);
  const client = useSelector(state =>
    clientId !== null || project ?
      state.clientsReducer.clients.filter(c => c.id === (project ? project.domain_id : clientId))[0]
      : null);

  useEffect(() => {
    if (loaded) {
      switch (content) {
        case ContentTypes.ManageClient:
          dispatch(setLocationData({ client: resId }));
          setClientId(resId);
          break;
        case ContentTypes.ManageProject:
          dispatch(setLocationData({ project: resId }));
          setProjectId(resId);
          break;
        case ContentTypes.ManageReport:
          dispatch(setLocationData({ report: resId }));
          setReportId(resId);
          break;
        default:
          setClientId(null);
          setProjectId(null);
          setReportId(null);
      }
    } else {
      if (!content) {
        setReady(true);
      }
    }
  }, [content, loaded, params]);

  useEffect(() => {
    if (
      (content === ContentTypes.ManageClient && client) ||
      (content === ContentTypes.ManageProject && project) ||
      (content === ContentTypes.ManageReport && report) ||
      [
        ContentTypes.CreateClient,
        ContentTypes.CreateProject,
        ContentTypes.CreateReport,
      ].includes(content)
    ) {
      setReady(true);
    }
  }, [content, client, project, report]);

  useEffect(() => {
    if (clientId !== null || project) {
      dispatch(getClients());
    }
  }, [clientId, project]);

  useEffect(() => {
    if (projectId !== null || report) {
      dispatch(getProject(report ? report.project_id : projectId));
    }
  }, [projectId, report]);

  useEffect(() => {
    if (reportId !== null) {
      dispatch(getReport(reportId));
    }
  }, [reportId]);

  const performDelete = () => {
    switch (content) {
      case ContentTypes.ManageClient:
          dispatch(deleteClient(resId));
        break;
      case ContentTypes.ManageProject:
          dispatch(deleteProject(resId));
        break;
      case ContentTypes.ManageReport:
        dispatch(deleteReport(resId));
        break;
    }
  };

  return (
    <Screen className={styles.container} private onLoad={() => setLoaded(true)}>
      <div className={styles.header}>
        {!isNaN(resId) ? (
          <>
            <Breadcrumbs client={client} project={project} report={report} />
            <div className={styles.controls}>
              {!!ContentTypesToDeleteActionText[content] && (
                <Button transparent onClick={performDelete}>
                  <MdDelete className={styles.deleteIcon} />
                  <span>{ContentTypesToDeleteActionText[content]}</span>
                </Button>
              )}
              {content === ContentTypes.ManageReport && (
                <a className={styles.viewReport} href={report ? report.url : '#'} target="_blank">
                  <Button>View report</Button>
                </a>
              )}
            </div>
          </>
        ) : (
          <Breadcrumbs value={LocationTitles[content]} />
        )}
      </div>
      {ready ? (
        (content === ContentTypes.CreateClient && (
          <ClientManage />
        )) ||
        (content === ContentTypes.ManageClient && (
          !!client && <ClientManage data={client} />
        )) ||
        (content === ContentTypes.CreateProject && (
          <ProjectManage clientId={params.clientId} domains={clients} />
        )) ||
        (content === ContentTypes.ManageProject && (
          !!project && <ProjectManage data={project} clientId={project.domain_id} domains={clients} />
        )) ||
        (content === ContentTypes.CreateReport && (
          <ReportManage projectId={params.projectId} />
        )) ||
        (content === ContentTypes.ManageReport && (
          !!report && <ReportManage data={report} projectId={report.project_id} />
        )) || (
          <div></div>
        )
      ) : (
        <Loader inline className={styles.loader} />
      )}
    </Screen>
  );
};

export default Index;
