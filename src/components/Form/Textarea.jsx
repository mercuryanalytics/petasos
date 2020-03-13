import React from 'react';
import styles from './Textarea.module.css';

const Textarea = props => {
  const { field } = props;
  const classes = `${styles.container} ${props.className}`;

  return (
    <div className={classes}>
      {!!props.label && (
        <label>{props.label}</label>
      )}
      <textarea
        {...field.input}
        className={styles.control}
        placeholder={props.placeholder}
      />
      {field.meta.touched && field.meta.error && (
        <div className={styles.error}>{field.meta.error}</div>
      )}
    </div>
  );
};

export default Textarea;
