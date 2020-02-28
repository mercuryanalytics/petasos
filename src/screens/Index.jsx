import React, { useState, useEffect } from 'react';
import Endpoints from '../utils/endpoints';
import styles from './Index.module.css';
import Screen from './Screen';

const Index = () => {
  const [authKey, setAuthKey] = useState();
  const [error, setError] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    if (authKey) {
      fetch(Endpoints.Projects, {
        method: 'GET',
        headers: new Headers({
          'Authorization': `Bearer ${authKey}`,
          'Content-Type': 'application/json',
        }),
        // body: '',
      })
      .then(res => res.text())
      .then(res => setData(res))
      // .catch(res => console.log('fetch-error', res))
      // .then(res => res.json())
      // .then(res => setData(res.data))
      // .catch(res => setError(res))
    }
  }, [authKey]);

  const onLogin = ({ authKey }) => {
    setAuthKey(authKey);
  };

  return (
    <Screen private onLogin={onLogin}>
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
            <div>{JSON.stringify(data)}</div>
          </div>
        </div>
      </div>
    </Screen>
  );
};

export default Index;
