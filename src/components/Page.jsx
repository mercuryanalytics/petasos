import React from 'react';
import styles from './Page.module.css';
import Header from './Header';
import SideMenu from './SideMenu';

const Page = props => {
  if (props.private) {
    // @TODO Verify auth
  }
  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <Header />
      </div>
      <div className={styles.body}>
        <div className={styles.side}>
          <SideMenu />
        </div>
        <div className={styles.content}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Page;
