import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Index.module.css';
import { setLocationData } from '../store/location/actions';
import { getClient } from '../store/clients/actions';
import { getProject } from '../store/projects/actions';
import { getReport } from '../store/reports/actions';
import Screen from './Screen';
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
  const resId = +props.match.params.id;
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const report = useSelector(state =>
    reportId !== null ? state.reportsReducer.reports.filter(r => r.id === reportId)[0] : null);
  const project = useSelector(state =>
    projectId !== null || report ?
      state.projectsReducer.projects.filter(p => p.id === (report ? report.project_id : projectId))[0]
      : null);
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
    }
  }, [content, loaded]);

  useEffect(() => {
    if (clientId !== null || project) {
      dispatch(getClient(project ? project.domain_id : clientId));
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

  return (
    <Screen private onLoad={() => setLoaded(true)}>
      <div className={styles.container}>
        <div className={styles.header}>
          {!isNaN(resId) ? (
            <>
              <Breadcrumbs client={client} project={project} report={report} />
              <div className={styles.controls}>
                {!!ContentTypesToDeleteActionText[content] && (
                  <Button transparent>
                    <MdDelete className={styles.deleteIcon} />
                    <span>{ContentTypesToDeleteActionText[content]}</span>
                  </Button>
                )}
                {content === ContentTypes.ManageReport && (
                  <Button>View report</Button>
                )}
              </div>
            </>
          ) : (
            <Breadcrumbs value={LocationTitles[content]} />
          )}
        </div>
        {(content === ContentTypes.CreateClient && <ClientManage />) ||
          (content === ContentTypes.ManageClient && <ClientManage data={client} />) ||
          (content === ContentTypes.CreateProject && <ProjectManage />) ||
          (content === ContentTypes.ManageProject && <ProjectManage data={project} />) ||
          (content === ContentTypes.CreateReport && <ReportManage />) ||
          (content === ContentTypes.ManageReport && <ReportManage data={report} />)}
      </div>
    </Screen>
  );
};

export default Index;
