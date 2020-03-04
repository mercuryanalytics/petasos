import React from 'react';
import styles from './Index.module.css';
import Screen from './Screen';
import Account from '../components/Account';
import ClientCreate from '../components/ClientCreate';
import ClientManage from '../components/ClientManage';
import ProjectCreate from '../components/ProjectCreate';
import ProjectManage from '../components/ProjectManage';
import ReportCreate from '../components/ReportCreate';
import ReportManage from '../components/ReportManage';

export const ContentTypes = {
  Account: 'account',
  CreateClient: 'create-client',
  ManageClient: 'manage-client',
  CreateProject: 'create-project',
  ManageProject: 'manage-project',
  CreateReport: 'create-report',
  ManageReport: 'manage-report',
};

const Index = props => {
  const { content } = props;
  const resId = props.match.params.id;

  return (
    <Screen private>
      <div className={styles.container}>
        {(content === ContentTypes.Account && <Account />) ||
          (content === ContentTypes.CreateClient && <ClientCreate />) ||
          (content === ContentTypes.ManageClient && <ClientManage id={resId} />) ||
          (content === ContentTypes.CreateProject && <ProjectCreate />) ||
          (content === ContentTypes.ManageProject && <ProjectManage id={resId} />) ||
          (content === ContentTypes.CreateReport && <ReportCreate />) ||
          (content === ContentTypes.ManageReport && <ReportManage id={resId} />)}
      </div>
    </Screen>
  );
};

export default Index;
