import React, { useEffect } from 'react';
import styles from './Textarea.module.css';

const Textarea = props => {
  const { field, preview, label, disabled, placeholder } = props;
  const classes = `
    ${styles.container}
    ${props.className || ''}
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
      {!preview ? (
        <textarea
          {...field.input}
          className={styles.control}
          disabled={!!disabled}
          placeholder={placeholder}
        />
      ) : (
        <span className={styles.preview}>
          {field.input.value !== '' ? field.input.value : 'N/A'}
        </span>
      )}
      {!preview &&
        (!!props.persistErrors || field.meta.dirty || field.meta.submitFailed) &&
        field.meta.error && (
          <div className={styles.error}>{field.meta.error}</div>
        )}
    </div>
  );
};

export default Textarea;
