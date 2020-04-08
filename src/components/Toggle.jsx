import React, { useCallback } from 'react';
import styles from './Toggle.module.css';

let timeout = {};

const Toggle = props => {
  const { id, checked } = props;

  const throttleChange = useCallback((status) => {
    if (timeout[id]) {
      clearTimeout(timeout[id]);
    }
    timeout[id] = setTimeout(() => {
      if (props.onChange && status !== checked) {
        props.onChange(status);
        timeout[id] = null;
      }
    }, 50);
  }, [timeout, props.onChange, checked]);

  const handleChange = useCallback((event) => {
    throttleChange(!!event.target.checked);
    event.stopPropagation();
  }, [throttleChange]);

  return (
    <div className={styles.container}>
      <input
        className={styles.checkbox}
        type="checkbox"
        id={id}
        onChange={handleChange}
        checked={!!checked}
      />
      <label htmlFor={id} className={styles.switch}></label>
    </div>
  );
};

export default Toggle;
