import React, { useState, useEffect } from 'react';
import styles from './Project.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { MdPlayArrow, MdFolder } from 'react-icons/md';
import Loader from '../Loader';
import Report from './Report';
import ReportAdd from './ReportAdd';

const Project = props => {
  const { data, reports, open, loaded } = props;
  const [isTouched, setIsTouched] = useState(false);
  const [isOpen, setIsOpen] = useState(!!open);

  useEffect(() => {
    if (isOpen) {
      if (props.onOpen) {
        setIsTouched(true);
        props.onOpen(data);
      }
    } else if (props.onClose && isTouched) {
      props.onClose(data);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!!open !== isOpen) {
      setIsOpen(!!open);
    }
  }, [open]);

  const toggleOpen = (event) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
    event.preventDefault();
  };

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsAdding(props.isActiveAddLink && props.active);
  }, [props.active, props.isActiveAddLink]);

  return (
    <div className={`${styles.container} ${props.active && !isAdding ? styles.active : ''}`}>
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
            !loaded ? (
              <Loader inline className={styles.loader} />
            ) : (
              <span className={styles.noResults}>No results</span>
            )
          )}
          <ReportAdd projectId={data.id} active={isAdding} />
        </div>
      )}
    </div>
  );
};

export default Project;
