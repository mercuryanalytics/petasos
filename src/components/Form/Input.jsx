import React from 'react';
import styles from './Input.module.css';

const Input = props => {
  const { field } = props;
  const classes = `${styles.container} ${props.className}`;

  return (
    <div className={classes}>
      {!!props.label && (
        <label>{props.label}</label>
      )}
      <input
        {...field.input}
        className={styles.control}
        type={props.type || 'text'}
        placeholder={props.placeholder}
      />
      {field.meta.touched && field.meta.error && (
        <div className={styles.error}>{field.meta.error}</div>
      )}
    </div>
  );
};

export default Input;
