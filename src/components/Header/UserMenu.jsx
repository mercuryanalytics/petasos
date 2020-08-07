import React, { useState, useCallback } from 'react';
import styles from './UserMenu.module.css';
import Routes from '../../utils/routes';
import HeaderControl from './HeaderControl';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';

const UserMenu = props => {
  const { authUser, localUser } = props;
  const avatar = authUser.picture;
  const name = localUser.contact_name || authUser.nickname || authUser.name;
  let acronym = null;
  const [isOpen, setIsOpen] = useState(false);

  if (name) {
    let names = name.split(' ');
    if (names.length > 1) {
      acronym = names[0][0].toUpperCase() + names[1][0].toUpperCase();
    } else {
      acronym = name[0].toUpperCase();
    }
  }

  const toggleMenu = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <HeaderControl
      className={`${styles.container} ${isOpen ? styles.open : ''}`}
      onClick={toggleMenu}
      active={isOpen}
    >
      <Avatar className={styles.avatar} avatar={avatar} acronym={acronym} />
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
