import React from 'react';
import styles from './Checkbox.module.css';
import { MdCheck } from 'react-icons/md';

const Checkbox = props => {
  const { field, label, disabled } = props;
  const classes = `
    ${styles.container}
    ${props.className}
    ${disabled ? styles.disabled : ''}
  `;

  return (
    <div className={classes}>
      <label>
        <input
          {...field.input}
          disabled={!!disabled}
          className={styles.control}
          type="checkbox"
        />
        <span className={styles.toggle}>
          {!!field.input.value && <MdCheck className={styles.mark} />}
        </span>
        <span className={styles.label}>{!!label && label}</span>
      </label>
      {field.meta.touched && field.meta.error && (
        <div className={styles.error}>{field.meta.error}</div>
      )}
    </div>
  );
};

export default Checkbox;
