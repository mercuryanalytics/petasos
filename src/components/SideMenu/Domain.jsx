import React, { useState } from 'react';
import styles from './Domain.module.css';
import { MdPlayArrow } from 'react-icons/md';
import Avatar from '../Avatar';
import Project from './Project';
import ProjectAdd from './ProjectAdd';

const Domain = props => {
  const logo = null;
  const name = 'domain-name';
  const [isOpen, setIsOpen] = useState(!!props.open);
  const handleClick = (event) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
  };
  return (
    <div className={styles.container}>
      <div className={styles.title} onClick={handleClick}>
        <MdPlayArrow className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
        <Avatar className={styles.logo} avatar={logo} alt={name[0].toUpperCase()} />
        <span className={styles.name}>{name}</span>
      </div>
      {isOpen && (
        <div className={styles.content}>
          <Project open={true} />
          <Project />
          <ProjectAdd />
        </div>
      )}
    </div>
  );
};

export default Domain;
