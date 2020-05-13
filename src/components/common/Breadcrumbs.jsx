import React from 'react';
import styles from './Breadcrumbs.module.css';
import { Link } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';

const Breadcrumbs = props => {
  const { data } = props;

  return data ? (
    <div className={styles.container}>
      {data.map((frag, i) => (
        <span
          key={`breadcrumb-${i}`}
          className={`${styles.value} ${i === data.length-1 ? styles.active : ''}`}
        >
          {typeof frag === 'object' && frag !== null ? (
            i !== data.length-1 ? (
              <Link className={styles.link} to={frag.link}>{frag.text}</Link>
            ) : (
              <span>{frag.text}</span>
            )
          ) : (
            <span>{frag}</span>
          )}
          {i !== data.length-1 && <FaAngleRight className={styles.spacer} />}
        </span>
      ))}
    </div>
  ) : '';
};

export default Breadcrumbs;
