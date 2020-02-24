import React, { useState } from 'react';
import styles from './UserMenu.module.css';
import HeaderControl from './HeaderControl';
import Avatar from '../Avatar';

const UserMenu = () => {
  const avatar = null;
  const name = 'MercuryUser';
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <HeaderControl
      className={`${styles.container} ${isOpen ? styles.open : ''}`}
      onClick={toggleMenu}
      active={isOpen}
    >
      <Avatar className={styles.avatar} avatar={avatar} alt={name[0].toUpperCase()} />
      <span className={styles.name}>
        {name}
      </span>
      {isOpen && (
        <div className={styles.menu}>
          UserMenuContent
        </div>
      )}
    </HeaderControl>
  );
};

export default UserMenu;
