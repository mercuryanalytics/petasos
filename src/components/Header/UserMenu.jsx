import React, { useState } from 'react';
import styles from './UserMenu.module.css';
import Routes from '../../utils/routes';
import HeaderControl from './HeaderControl';
import Avatar from '../Avatar';
import { Link } from 'react-router-dom';

const UserMenu = props => {
  const { authUser, localUser } = props;
  const avatar = authUser.picture;
  const name = localUser.contact_name || authUser.nickname || authUser.name;
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
      <span className={styles.name}>{name}</span>
      {isOpen && (
        <div className={styles.menu}>
          <Link className={styles.menuLink} to={Routes.Account}>My account</Link>
          <Link className={styles.menuLink} to={Routes.Logout}>Log out</Link>
        </div>
      )}
    </HeaderControl>
  );
};

export default UserMenu;
