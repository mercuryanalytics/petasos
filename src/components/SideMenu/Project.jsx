import React, { useState, useEffect } from 'react';
import styles from './Project.module.css';
import { MdPlayArrow, MdFolder } from 'react-icons/md';
import Report from './Report';
import ReportAdd from './ReportAdd';

const Project = props => {
  const { data, reports } = props;
  const [isOpen, setIsOpen] = useState(!!props.open);

  const toggleOpen = (event) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
  };

  useEffect(() => {
    if (isOpen && props.onOpen) {
      props.onOpen(data);
    }
  }, [isOpen]);

  return (
    <div className={`${styles.container} ${props.active ? styles.active : ''}`}>
      <div className={styles.title} onClick={toggleOpen}>
        <MdPlayArrow className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
        <MdFolder className={styles.icon} />
        <span className={styles.name}>{data.name}</span>
      </div>
      {isOpen && (
        <div className={styles.content}>
          {reports && !!reports.length && reports.map(report => (
            <Report
              key={`report-btn-${report.id}`}
              data={report}
              active={props.activeReport === report.id}
            />
          ))}
          <ReportAdd />
        </div>
      )}
    </div>
  );
};

export default Project;
