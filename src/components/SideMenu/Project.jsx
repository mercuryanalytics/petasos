import React, { useState } from 'react';
import styles from './Project.module.css';
import { MdPlayArrow, MdFolder } from 'react-icons/md';
import Report from './Report';
import ReportAdd from './ReportAdd';

const Project = props => {
  const name = 'project-name';
  const [isOpen, setIsOpen] = useState(!!props.open);
  const handleClick = (event) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
  };
  return (
    <div className={styles.container}>
      <div className={styles.title} onClick={handleClick}>
        <MdPlayArrow className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
        <MdFolder className={styles.icon} />
        <span className={styles.name}>{name}</span>
      </div>
      {isOpen && (
        <div className={styles.content}>
          <Report />
          <Report />
          <ReportAdd />
        </div>
      )}
    </div>
  );
};

export default Project;
