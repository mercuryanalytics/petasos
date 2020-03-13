import React from 'react';
import styles from './Loader.module.css';

const Loader = props => {
  return (
    <div className={`${styles.container} ${props.className || ''} ${!!props.inline && styles.inline}`}>
      <div className={styles.loader}>
        {[1,2,3,4,5].map(n => <div key={n} className={styles[`r${n}`]}></div>)}
      </div>
    </div>
  );
};

export default Loader;
