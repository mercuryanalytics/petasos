import React from 'react';
import styles from './ProjectAdd.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { Folder } from '../Icons';

const ProjectAdd = props => {
  return (
    <div className={`${styles.container} ${props.active ? styles.active : ''}`}>
      <Link to={Routes.CreateProject.replace(':clientId', props.clientId)}>
        <div className={styles.button}>
          <Folder className={styles.icon} />
          <span className={styles.name}>+ Add new project</span>
        </div>
      </Link>
    </div>
  );
};

export default ProjectAdd;
