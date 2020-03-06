import React from 'react';
import styles from './Input.module.css';

const Input = props => {
  const baseClasses = `
    ${styles.container}
    ${props.transparent ? styles.transparent : ''}
    ${props.className || ''}
  `;
  return (
    <input type={props.type} />
  );
};

export default Input;
