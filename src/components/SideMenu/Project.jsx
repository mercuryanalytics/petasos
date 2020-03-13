import React, { useState, useEffect } from 'react';
import styles from './Project.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { MdPlayArrow, MdFolder } from 'react-icons/md';
import Loader from '../Loader';
import Report from './Report';
import ReportAdd from './ReportAdd';

const Project = props => {
  const { data, reports } = props;
  const [isOpen, setIsOpen] = useState(!!props.open);

  const toggleOpen = (event) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
    event.preventDefault();
  };

  useEffect(() => {
    if (isOpen && props.onOpen) {
      props.onOpen(data);
    }
  }, [isOpen]);

  useEffect(() => {
    if (props.open !== isOpen) {
      setIsOpen(props.open);
    }
  }, [props.open]);

  return (
    <div className={`${styles.container} ${props.active ? styles.active : ''}`}>
      <Link className={styles.title} to={Routes.ManageProject.replace(':id', data.id)}>
        <MdPlayArrow
          className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
          onClick={toggleOpen}
        />
        <MdFolder className={styles.icon} />
        <span className={styles.name}>{data.name}</span>
      </Link>
      {isOpen && (
        <div className={styles.content}>
          {!!reports && !!reports.length ? (
            reports.map(report => (
              <Report
                key={`report-btn-${report.id}`}
                data={report}
                active={props.activeReport === report.id}
              />
            ))
          ) : (
            <Loader inline className={styles.loader} />
          )}
          <ReportAdd projectId={data.id} />
        </div>
      )}
    </div>
  );
};

export default Project;
