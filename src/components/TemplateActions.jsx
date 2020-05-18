import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styles from './TemplateActions.module.css';
import Loader from './common/Loader';
import Avatar from './common/Avatar';
import Toggle from './common/Toggle';
import Scrollable from './common/Scrollable';
import { File, Folder } from './Icons';
import { MdPlayArrow } from 'react-icons/md';
import { getTemplates, updateTemplate } from '../store/clients/actions';

const TemplateActions = props => {
  const { clientId } = props;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [openProjects, setOpenProjects] = useState({});
  const [activeStates, setActiveStates] = useState({});

  const init = useCallback(() => {
    return dispatch(getTemplates(clientId)).then((action) => {
      setClient(action.payload);
      try {
        setOpenProjects({ [action.payload.projects[0].id]: true });
      } catch (e) {}
    }, () => {});
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      setOpenProjects({});
      init().then(() => setIsLoading(false));
    }
  }, [clientId]);

  const handleProjectToggle = useCallback(async (id) => {
    const status = !!openProjects[id];
    setOpenProjects(prev => ({ ...prev, [id]: !status }));
  }, [openProjects]);

  const getItemStatus = useCallback((type, id, pid) => {
    const currentState = activeStates[`${type}-${id}`];
    if (currentState === true || currentState === false) {
      return currentState;
    }
    try {
      switch (type) {
        case 'client':
          return !!client.authorized;
        case 'project':
          return !!(client.projects.filter(p => p.id === id)[0].authorized);
        case 'report':
          return !!(client.projects.filter(p => p.id === pid)[0]
            .reports.filter(r => r.id === id)[0].authorized);
      }
    } catch (e) {}
    return false;
  }, [activeStates, client]);

  const setItemStatus = useCallback((type, id, status) => {
    const currentState = activeStates[`${type}-${id}`];
    if (typeof currentState === 'undefined' || status !== currentState) {
      setActiveStates(prev => ({ ...prev, [`${type}-${id}`]: status }));
      dispatch(updateTemplate({
        resource_type: type,
        resource_id: id,
        state: status ? 1 : 0,
      }, clientId)).then(() => {}, () => {});
    }
  }, [activeStates, clientId]);

  return !isLoading ? (
    <div className={`${styles.container} ${props.className || ''}`}>
      {!!client && (<>
        <div className={styles.checkboxesTitles}>
          <div className={styles.checkboxTitle}>
            <div>View</div>
          </div>
        </div>
        <Scrollable className={styles.templatesActions}>
          <div className={styles.client}>
            <div className={styles.title} title={client.name}>
              <Avatar className={styles.logo} avatar={client.logo_url} alt={client.name[0].toUpperCase()} />
              <span className={styles.name}>{client.name}</span>
              <Toggle
                id={`client-toggle-${client.id}`}
                className={styles.itemToggle}
                checked={getItemStatus('client', client.id)}
                onChange={status => setItemStatus('client', client.id, status)}
              />
            </div>
            {!!client.projects && client.projects.map(project => (<div key={project.id}>
              <div className={styles.project}>
                <div
                  className={styles.title}
                  title={project.name}
                  onClick={() => handleProjectToggle(project.id)}
                >
                  <MdPlayArrow className={`${styles.arrow} ${!!openProjects[project.id] ? styles.open : ''}`} />
                  <Folder className={styles.icon} />
                  <span className={styles.name}>{project.name}</span>
                  <Toggle
                    id={`project-toggle-${project.id}`}
                    className={styles.itemToggle}
                    checked={getItemStatus('project', project.id)}
                    onChange={status => setItemStatus('project', project.id, status)}
                  />
                </div>
              </div>
              {!!openProjects[project.id] && (
                !!project.reports && !!project.reports.length ? (
                  project.reports.map(report => (
                    <div key={report.id} className={styles.report} title={report.name}>
                      <div className={styles.title}>
                        <File className={styles.icon} />
                        <span className={styles.name}>{report.name}</span>
                        <Toggle
                          id={`report-toggle-${report.id}`}
                          className={styles.itemToggle}
                          checked={getItemStatus('report', report.id, project.id)}
                          onChange={status => setItemStatus('report', report.id, status)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>No results</div>
                )
              )}
            </div>))}
          </div>
        </Scrollable>
      </>)}
    </div>
  ) : (
    <div className={styles.loaderContainer}>
      <Loader inline className={styles.loader} />
    </div>
  );
};

export default TemplateActions;
