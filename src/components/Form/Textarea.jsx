import React from 'react';
import styles from './Textarea.module.css';
import { Field } from 'redux-form';

const Textarea = props => {
  const classes = `${styles.container} ${props.className}`;

  return (
    <div className={classes}>
      {!!props.label && (
        <label>{props.label}</label>
      )}
      <Field
        className={styles.control}
        component="textarea"
        name={props.name}
        placeholder={props.placeholder}
      />
      {!!props.errors && props.errors.map(error => (
        <div className={styles.error}>{error}</div>
      ))}
    </div>
  );
};

export default Textarea;
