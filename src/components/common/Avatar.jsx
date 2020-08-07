import React from 'react';
import styles from './Avatar.module.css';

const Avatar = props => {
  const { avatar, alt, acronym } = props;

  return (
    <div className={`${styles.container} ${props.className || ''}`}>
      {(!!avatar && (
        <img src={avatar} alt="" />
      )) || (!!acronym && (
        <span>{props.acronym}</span>
      )) || (!!alt && (
        <span>{props.alt}</span>
      ))}
    </div>
  );
};

export default Avatar;
