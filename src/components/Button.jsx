import React from 'react';
import styles from './Button.module.css';
import { Link } from 'react-router-dom';

const Button = props => {
  const baseClasses = `
    ${styles.container}
    ${props.transparent ? styles.transparent : ''}
    ${props.className || ''}
  `;
  return props.link ? (
    <Link className={`${baseClasses} ${styles.link}`} to={props.link}>
      {props.children}
    </Link>
  ) : (
    <button type={props.type || 'button'} className={`${baseClasses}`} onClick={props.onClick}>
      {props.children}
    </button>
  );
};

export default Button;
