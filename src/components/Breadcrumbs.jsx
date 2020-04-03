import React from 'react';
import styles from './Breadcrumbs.module.css';
import { FaAngleRight } from 'react-icons/fa';

const Breadcrumbs = props => {
  const { data } = props;

  return data ? (
    <div className={styles.container}>
      {data.map((fragment, i) => (
        <span key={`breadcrumb-${i}`} className={styles.value}>
          <span>{fragment}</span>
          {i !== data.length-1 && <FaAngleRight className={styles.spacer} />}
        </span>
      ))}
    </div>
  ) : '';
};

export default Breadcrumbs;
