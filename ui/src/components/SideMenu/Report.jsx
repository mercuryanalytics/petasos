import React from 'react';
import styles from './Report.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { File } from '../Icons';

const Report = props => {
  const { data, active, orphan, isSearching, filteredReports } = props;

  return (
    <Link
      style={isSearching && !filteredReports[data.id] ? { display: 'none' } : {}}
      className={`${styles.container} ${active ? styles.active : ''} ${orphan ? styles.orphan : ''}`}
      id={`sidemenu-report-${data.id}`}
      to={Routes.ManageReport.replace(':id', data.id)}
      title={data.name}
    >
      <div className={styles.title}>
        <File className={styles.icon} />
        <span className={styles.name}>{data.name}</span>
      </div>
    </Link>
  );
};

export default Report;
