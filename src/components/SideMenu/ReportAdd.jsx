import React from 'react';
import styles from './ReportAdd.module.css';
import { MdInsertDriveFile } from 'react-icons/md';

const ReportAdd = () => {
  return (
    <div className={styles.container}>
      <div className={styles.button}>
        <MdInsertDriveFile className={styles.icon} />
        <span className={styles.name}>+ Add new report</span>
      </div>
    </div>
  );
};

export default ReportAdd;
