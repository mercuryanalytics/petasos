import React, { useEffect } from 'react';
import styles from './Checkbox.module.css';
import { MdCheck } from 'react-icons/md';

const Checkbox = props => {
  const { field, label, disabled } = props;
  const { onChange } = props;
  const classes = `
    ${styles.container}
    ${props.className || ''}
    ${disabled ? styles.disabled : ''}
  `;

  useEffect(() => {
    if (field && typeof props.value !== 'undefined') {
      field.input.onChange(props.value);
    }
  }, [props.value]);

  return (
    <div className={classes}>
      <label>
        <input
          {...(!!field ? field.input : {
            onChange,
            value: !!props.value,
          })}
          disabled={!!disabled}
          className={styles.control}
          type="checkbox"
        />
        <span className={styles.toggle}>
          <MdCheck className={styles.mark} />
        </span>
        {!!label && (
          <span className={styles.label}>{label}</span>
        )}
      </label>
      {!!field && field.meta.touched && field.meta.error && (
        <div className={styles.error}>{field.meta.error}</div>
      )}
    </div>
  );
};

export default Checkbox;
