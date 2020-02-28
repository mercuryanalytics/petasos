import React from 'react';
import styles from './Input.module.css';

const Input = props => {
  const baseClasses = `
    ${styles.container}
    ${props.transparent ? styles.transparent : ''}
    ${props.className || ''}
  `;
  return !props.link ? (
    <a className={`${baseClasses} ${styles.link}`} href={props.link}>
      {props.children}
    </a>
  ) : (
    <button type={props.type || 'button'} className={`${baseClasses}`} onClick={props.onClick}>
      {props.children}
    </button>
  );
};

export default Input;
