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
    if (field && typeof props.checked !== 'undefined') {
      field.input.onChange(props.checked);
    }
  }, [props.checked]);

  return (
    <div className={classes} {...(!!disabled ? { 'data-checkbox-disabled': 1 } : {})}>
      <label>
        <input
          {...(!!field ? field.input : {
            onChange,
            checked: !!props.checked,
          })}
          disabled={!!disabled}
          className={styles.control}
          type="checkbox"
        />
        <span {...(!!props.checked ? { 'data-checked': 1 } : {})} className={styles.toggle}>
          <MdCheck className={styles.mark} />
        </span>
        {!!label && (
          <span data-checkbox-label className={styles.label}>{label}</span>
        )}
      </label>
      {!!field && field.meta.touched && field.meta.error && (
        <div className={styles.error}>{field.meta.error}</div>
      )}
    </div>
  );
};

export default Checkbox;
