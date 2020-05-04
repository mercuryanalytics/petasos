import React from 'react';
import styles from './Scrollable.module.css';

const Scrollable = props => {
  return (
    <div className={`${styles.container} ${props.className || ''}`}>
      {props.children}
    </div>
  );
};

export default Scrollable;
