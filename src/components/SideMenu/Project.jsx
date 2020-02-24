import React, { useState } from 'react';
import styles from './Project.module.css';
import { MdPlayArrow, MdFolder } from 'react-icons/md';
import Report from './Report';

const Project = props => {
  const name = 'project-name';
  const [isOpen, setIsOpen] = useState(!!props.open);
  const handleClick = (event) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
  };
  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.title}>
        <MdPlayArrow className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
        <MdFolder className={styles.icon} />
        <span className={styles.name}>{name}</span>
      </div>
      {isOpen && (
        <div className={styles.content}>
          <Report />
        </div>
      )}
    </div>
  );
};

export default Project;
