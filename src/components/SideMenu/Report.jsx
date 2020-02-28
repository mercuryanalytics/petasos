import React from 'react';
import styles from './Report.module.css';
import { MdInsertDriveFile } from 'react-icons/md';

const Report = () => {
  const name = 'report-name.ext';
  const handleClick = (event) => {
    event.stopPropagation();
  };
  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.title}>
        <MdInsertDriveFile className={styles.icon} />
        <span className={styles.name}>{name}</span>
      </div>
    </div>
  );
};

export default Report;
