import React, { useState } from 'react';
import styles from './UserMenu.module.css';
import Routes from '../../utils/routes';
import HeaderControl from './HeaderControl';
import Avatar from '../Avatar';

const UserMenu = props => {
  const { user } = props;
  const avatar = user.picture;
  const name = user.nickname || user.name;

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
          <a href={Routes.Logout}>Logout</a>
        </div>
      )}
    </HeaderControl>
  );
};

export default UserMenu;
