import React from 'react';
import styles from './ReportAdd.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { File } from '../Icons';

const ReportAdd = props => {
  return (
    <div className={`${styles.container} ${props.active ? styles.active : ''}`}>
      <Link to={Routes.CreateReport.replace(':projectId', props.projectId)}>
        <div className={styles.button}>
          <File className={styles.icon} />
          <span className={styles.name}>+ Add new report</span>
        </div>
      </Link>
    </div>
  );
};

export default ReportAdd;
