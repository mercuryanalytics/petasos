import React, { useEffect } from 'react';
import styles from './Input.module.css';

const Input = props => {
  const { field, preview, label, type, disabled, placeholder } = props;
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
  }, [props]);

  return (
    <div className={classes}>
      {!!label && (
        <label>{label}</label>
      )}
      {!preview ? (
        <input
          {...field.input}
          className={styles.control}
          type={type || 'text'}
          disabled={!!disabled}
          placeholder={placeholder}
        />
      ) : (
        <span className={styles.preview}>
          {field.input.value !== '' ? field.input.value : 'N/A'}
        </span>
      )}
      {!!field && !preview && (
        !!props.persistErrors || field.meta.dirty || field.meta.submitFailed
      ) && field.meta.error && (
        field.meta.error.indexOf('[') === 0 ? (
          JSON.parse(field.meta.error).map((error, i) => (
            <div key={i} className={styles.error}>{error}</div>
          ))
        ) : (
          <div className={styles.error}>{field.meta.error}</div>
        )
      )}
    </div>
  );
};

export default Input;
