import React from 'react';
import styles from './Index.module.css';
import Page from '../components/Page';

const Index = () => {
  return (
    <Page private={true}>
      <div className={styles.container}>
        <div className={styles.item}>
          <div className={styles.header}>
            <div className={styles.titles}>
              <span className={styles.tag}>ItemTag</span>
              <span className={styles.name}>ItemPath... / ItemName</span>
            </div>
            <div className={styles.controls}>
            </div>
          </div>
          <div className={styles.content}>
            [ItemViewContent]
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Index;
