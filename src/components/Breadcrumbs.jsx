import React from 'react';
import styles from './Breadcrumbs.module.css';

const Breadcrumbs = props => {
  const { value, client, project, report } = props;

  return !value ? (
    <div className={styles.container}>
      {client && (
          <span>
            <span>{client.name}</span>
            {project && (
              <span>
                <span> > {project.name}</span>
                {report && (
                  <span> > {report.name}</span>
                )}
              </span>
            )}
          </span>
      )}
    </div>
  ) : (
    <div className={styles.container}>{value}</div>
  )
};

export default Breadcrumbs;
