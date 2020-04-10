import React from 'react';
import styles from './Button.module.css';
import { Link } from 'react-router-dom';
import Loader from './Loader';

const renderLoader = () => (
  <Loader inline size={3} className={styles.loader} />
);

const Button = props => {
  const { loading } = props;
  const baseClasses = `
    ${styles.container}
    ${props.transparent ? styles.transparent : ''}
    ${props.disabled ? styles.disabled : ''}
    ${props.action ? styles.action : ''}
    ${props.className || ''}
  `;

  const link = !!props.link ?
    (props.link.match(/^.+\:\/\//) ? props.link : `http://${props.link}`)
    : null;

  return (!!link && (
    <a className={`${baseClasses} ${styles.link}`} href={link} target={props.target || '_self'}>
      {props.children}
      {!!loading && renderLoader()}
    </a>
  )) ||
  (!!props.to && (
    <Link className={`${baseClasses} ${styles.link}`} to={props.to}>
      {props.children}
      {!!loading && renderLoader()}
    </Link>
  )) ||
  (
    <button type={props.type || 'button'} disabled={!!props.disabled} className={`${baseClasses}`} onClick={props.onClick}>
      {props.children}
      {!!loading && renderLoader()}
    </button>
  );
};

export default Button;
