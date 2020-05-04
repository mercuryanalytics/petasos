import React from 'react';
import styles from './Scrollable.module.css';
import SimpleBarReact from 'simplebar-react';
import 'simplebar/src/simplebar.css';

const Scrollable = props => {
  return (
    <SimpleBarReact className={`${styles.container} ${props.className || ''}`}>
      {props.children}
    </SimpleBarReact>
  );
};

export default Scrollable;
