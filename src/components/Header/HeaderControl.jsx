import React from 'react';
import styles from './HeaderControl.module.css';

const HeaderControl = props => {
  return !!props.link ? (
    <a className={`${styles.container} ${styles.link} ${props.className}`} href={props.link}>
      {props.children}
    </a>
  ) : (
    <div
      className={`${styles.container} ${props.active ? styles.active : ''} ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};

export default HeaderControl;
