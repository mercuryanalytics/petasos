import React from 'react';
import styles from './ProjectAdd.module.css';
import { MdFolder } from 'react-icons/md';

const ProjectAdd = () => {
  return (
    <div className={styles.container}>
      <div className={styles.button}>
        <MdFolder className={styles.icon} />
        <span className={styles.name}>+ Add new project</span>
      </div>
    </div>
  );
};

export default ProjectAdd;
