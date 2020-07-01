import React, { useState, useEffect } from 'react';
import styles from './Client.module.css';
import Routes from '../../utils/routes';
import { Link } from 'react-router-dom';
import { MdPlayArrow } from 'react-icons/md';
import Loader from '../common/Loader';
import Avatar from '../common/Avatar';
import Project from './Project';
import ProjectAdd from './ProjectAdd';
import Report from './Report';

const Client = props => {
  const { data, projects, reports, clientReports, open, loaded, openProjects, loadedProjects } = props;
  const [isTouched, setIsTouched] = useState(false);
  const [isOpen, setIsOpen] = useState(!!open);

  useEffect(() => {
    if (isOpen) {
      if (!isTouched) {
        setIsTouched(true);
      } else if (props.onOpen) {
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
    setIsTouched(true);
    setIsOpen(!isOpen);
    event.stopPropagation();
    event.preventDefault();
  };

  const onProjectOpen = (project) => {
    if (props.onProjectOpen) {
      props.onProjectOpen(project);
    }
  };

  const onProjectClose = (project) => {
    if (props.onProjectClose) {
      props.onProjectClose(project);
    }
  };

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsAdding(props.isActiveAddLink && props.active);
  }, [props.active, props.isActiveAddLink]);

  return (
    <div
      className={`${styles.container} ${props.active && !isAdding ? styles.active : ''}`}
      id={`sidemenu-client-${data.id}`}
    >
      <Link className={styles.title} to={Routes.ManageClient.replace(':id', data.id)} title={data.name}>
        <MdPlayArrow
          className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
          onClick={toggleOpen}
        />
        <Avatar className={styles.logo} avatar={data.logo_url} alt={data.name[0].toUpperCase()} />
        <span className={styles.name}>{data.name}</span>
      </Link>
      {isOpen && (
        <div className={styles.content}>
          {projects && clientReports && !!(projects.length || clientReports.length) ? <>
            {projects.map(project => (
              <Project
                key={`project-btn-${project.id}`}
                data={project}
                reports={reports.filter(r => r.project_id === project.id)}
                open={!!openProjects[project.id]}
                loaded={!!loadedProjects[project.id]}
                active={props.activeProject === project.id}
                activeReport={props.activeReport}
                isActiveAddLink={props.isActiveAddLink}
                canCreateReports={props.canCreateReports}
                onOpen={onProjectOpen}
                onClose={onProjectClose}
              />
            ))}
            {clientReports.map(clientReport => (
              <Report
                key={`client-report-btn-${clientReport.id}`}
                data={clientReport}
                active={props.activeReport === clientReport.id}
                orphan={true}
              />
            ))}
          </> : (
            !loaded ? (
              <Loader inline className={styles.loader} />
            ) : (
              <div className={styles.noResults}>No results</div>
            )
          )}
          {!!props.canCreateProjects[data.id] && (
            <ProjectAdd clientId={data.id} active={isAdding} />
          )}
        </div>
      )}
    </div>
  );
};

export default Client;
