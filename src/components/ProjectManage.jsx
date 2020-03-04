import React from 'react';
import styles from './ProjectManage.module.css';

const ProjectManage = props => {
  return (
    <div className={styles.container}>
      [ProjectManage-{props.id}]
    </div>
  );
};

export default ProjectManage;
