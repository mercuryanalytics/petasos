import React from 'react';
import styles from './HeaderControl.module.css';
import { Link } from 'react-router-dom';

const HeaderControl = props => {
  return !!props.link ? (
    <Link className={`${styles.container} ${styles.link} ${props.className}`} to={props.link}>
      {props.children}
    </Link>
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
