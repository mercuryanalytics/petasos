import React, { useEffect } from 'react';
import styles from './Input.module.css';

const Input = props => {
  const { field, label, type, disabled, placeholder } = props;
  const classes = `
    ${styles.container}
    ${props.className}
    ${disabled ? styles.disabled : ''}
  `;

  useEffect(() => {
    if (typeof props.value !== 'undefined') {
      try {
        field.input.onChange(props.value);
      } catch (e) {}
    }
  }, [props.value]);

  return (
    <div className={classes}>
      {!!label && (
        <label>{label}</label>
      )}
      <input
        {...field.input}
        className={styles.control}
        type={type || 'text'}
        disabled={!!disabled}
        placeholder={placeholder}
      />
      {field.meta.touched && field.meta.error && (
        <div className={styles.error}>{field.meta.error}</div>
      )}
    </div>
  );
};

export default Input;
