import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Index.module.css';
import { setLocationData } from '../store/location/actions';
import { getAuthorizedUsers } from '../store/users/actions';
import Screen from './Screen';
import AccessRestricted from './AccessRestricted';
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
  const [accessOptions, setAccessOptions] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [keepLoading, setKeepLoading] = useState(true);
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

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
    if (isLoaded) {
      if (accessOptions) {
        dispatch(getAuthorizedUsers(0, accessOptions)).then(action => {
          setIsAccessBlocked(action.type === 'GET_AUTHORIZED_USERS_FAILURE');
          setKeepLoading(false);
        });
      } else {
        setKeepLoading(false);
      }
    }
  }, [isLoaded, accessOptions]);

  return !isAccessBlocked ? (
    <Screen className={styles.container} private keepLoading={keepLoading} onLoad={() => setIsLoaded(true)}>
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
  ) : (
    <AccessRestricted />
  );
};

export default Index;
