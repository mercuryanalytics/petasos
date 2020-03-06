import React from 'react';
import styles from './Textarea.module.css';
import { Field } from 'redux-form';

const Textarea = props => {
  const classes = `${styles.container} ${props.className}`;

  return (
    <Field
      className={classes}
      component="textarea"
      name={props.name}
      placeholder={props.placeholder}
      value={props.value}
    />
  );
};

export default Textarea;
