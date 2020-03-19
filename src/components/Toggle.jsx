import React, { useState } from 'react';
import styles from './Toggle.module.css';

const Toggle = props => {
  const { id, active } = props;
  const [status, setStatus] = useState(!!active);

  const handleChange = (event) => {
    let newStatus = !!event.target.checked;
    setStatus(newStatus);
    if (props.onChange) {
      props.onChange(newStatus);
    }
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.checkbox}
        type="checkbox"
        id={id}
        onChange={handleChange}
        checked={status}
      />
      <label htmlFor={id} className={styles.switch}></label>
    </div>
  );
};

export default Toggle;
