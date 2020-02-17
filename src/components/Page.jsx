import React from 'react';
import styles from './Page.module.css';
import Header from './Header';

const Page = props => {
  // @TODO Handle auth with 'private' pages
  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <Header />
      </div>
      <div className={styles.body}>
        {props.children}
      </div>
    </div>
  );
};

export default Page;