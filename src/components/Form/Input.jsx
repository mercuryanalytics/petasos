import React from 'react';
import styles from './Input.module.css';
import { Field } from 'redux-form';

const Input = props => {
  const classes = `${styles.container} ${props.className}`;

  return (
    <Field
      className={classes}
      component="input"
      type={props.type || 'text'}
      name={props.name}
      placeholder={props.placeholder}
      value={props.value}
    />
  );
};

export default Input;
