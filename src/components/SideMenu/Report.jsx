import React from 'react';
import styles from './Report.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { FiFile } from 'react-icons/fi';

const Report = props => {
  const { data, active, orphan } = props;

  return (
    <Link
      className={`${styles.container} ${active ? styles.active : ''} ${orphan ? styles.orphan : ''}`}
      to={Routes.ManageReport.replace(':id', data.id)}
      title={data.name}
    >
      <div className={styles.title}>
        <FiFile className={styles.icon} />
        <span className={styles.name}>{data.name}</span>
      </div>
    </Link>
  );
};

export default Report;
