import React from 'react';
import styles from './Loader.module.css';

const Loader = props => {
  const size = props.size || 5;
  const segments = [];

  for (let i = 0; i < size; i++) {
    segments.push(i+1);
  }

  return (
    <div
      data-app-loader="1"
      className={`app-loader ${styles.container} ${props.className || ''} ${!!props.inline && styles.inline}`}
    >
      <div className={styles.loader}>
        {segments.map(n => <div key={n} className={styles[`r${n}`]}></div>)}
      </div>
    </div>
  );
};

export default Loader;
