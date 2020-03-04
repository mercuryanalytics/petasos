import React from 'react';
import styles from './ReportAdd.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { MdInsertDriveFile } from 'react-icons/md';

const ReportAdd = () => {
  return (
    <div className={styles.container}>
      <Link to={Routes.CreateReport}>
        <div className={styles.button}>
          <MdInsertDriveFile className={styles.icon} />
          <span className={styles.name}>+ Add new report</span>
        </div>
      </Link>
    </div>
  );
};

export default ReportAdd;
