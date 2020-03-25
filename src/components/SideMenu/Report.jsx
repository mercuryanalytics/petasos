import React from 'react';
import styles from './Report.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { MdInsertDriveFile } from 'react-icons/md';

const Report = props => {
  const { data } = props;

  return (
    <Link
      className={`${styles.container} ${props.active ? styles.active : ''}`}
      to={Routes.ManageReport.replace(':id', data.id)}
      title={data.name}
    >
      <div className={styles.title}>
        <MdInsertDriveFile className={styles.icon} />
        <span className={styles.name}>{data.name}</span>
      </div>
    </Link>
  );
};

export default Report;
