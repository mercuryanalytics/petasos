import React from 'react';
import styles from './Avatar.module.css';

const Avatar = props => {
  return (
    <div className={`${styles.container} ${props.className || ''}`}>
      {!!props.avatar ? (
        <img src={props.avatar} />
      ) : (
        <span>{props.alt}</span>
      )}
    </div>
  );
};

export default Avatar;
