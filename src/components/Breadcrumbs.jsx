import React from 'react';
import styles from './Breadcrumbs.module.css';

const Breadcrumbs = props => {
  const { data } = props;

  return data ? (
    <div className={styles.container}>
      {data.map((fragment, i) => (
        <span key={`breadcrumb-${i}`}>{fragment}{i !== data.length-1 && ' > '}</span>
      ))}
    </div>
  ) : '';
};

export default Breadcrumbs;
