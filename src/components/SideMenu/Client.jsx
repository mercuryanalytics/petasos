import React, { useState, useEffect } from 'react';
import styles from './Client.module.css';
import { MdPlayArrow } from 'react-icons/md';
import Avatar from '../Avatar';
import Project from './Project';
import ProjectAdd from './ProjectAdd';

const Client = props => {
  const { data, projects, reports } = props;
  const [isOpen, setIsOpen] = useState(!!props.open);
  const [openProjects, setOpenProjects] = useState(props.openProjects || {});

  const toggleOpen = (event) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
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

  const onProjectOpen = (project) => {
    if (props.onProjectOpen) {
      props.onProjectOpen(project);
    }
  };

  useEffect(() => {
    setOpenProjects({ ...props.openProjects });
  }, [props.openProjects]);

  return (
    <div className={`${styles.container} ${props.active ? styles.active : ''}`}>
      <div className={styles.title} onClick={toggleOpen}>
        <MdPlayArrow className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
        <Avatar className={styles.logo} avatar={data.logo} alt={data.name[0].toUpperCase()} />
        <span className={styles.name}>{data.name}</span>
      </div>
      {isOpen && (
        <div className={styles.content}>
          {projects && !!projects.length && projects.map(project => (
            <Project
              key={`project-btn-${project.id}`}
              data={project}
              reports={reports.filter(r => r.project_id === project.id)}
              open={!!openProjects[project.id]}
              active={props.activeProject === project.id}
              activeReport={props.activeReport}
              onOpen={onProjectOpen}
            />
          ))}
          <ProjectAdd />
        </div>
      )}
    </div>
  );
};

export default Client;
