import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Search.module.css';
import { MdSearch, MdCheck } from 'react-icons/md';

const Search = props => {
  const { targets, hasShadows } = props;
  const [value, setValue] = useState('');
  const valueRef = useRef(null);
  const [searchTargets, setSearchTargets] = useState(null);
  const [showTargets, setShowTargets] = useState(false);
  const [overTargets, setOverTargets] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setSearchTargets([ ...(targets || []) ]);
  }, [targets]);

  useEffect(() => {
    if (isTouched && props.onSearch) {
      props.onSearch(value, searchTargets);
    }
  }, [isTouched, value, searchTargets]);

  const handleChange = useCallback((event) => {
    setValue(event.target.value);
    setIsTouched(true);
  });

  const handleTargetChange = useCallback((targetKey, value) => {
    valueRef.current.focus();
    let newTargets = [ ...targets ];
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].key === targetKey) {
        newTargets[i].value = !!value;
        break;
      }
    }
    setSearchTargets(newTargets);
  }, [valueRef, searchTargets]);

  return (
    <div className={`${styles.container} ${hasShadows ? styles.shadows : ''}`}>
      <input
        className={`${styles.input} ${showTargets ? styles.active : ''}`}
        type="text"
        ref={valueRef}
        placeholder={props.placeholder}
        onChange={handleChange}
        onFocus={e => setShowTargets(true)}
        onBlur={() => !overTargets && setShowTargets(false)}
      />
      <MdSearch className={styles.icon} />
      {showTargets && !!searchTargets.length &&  (
        <div
          className={styles.targets}
          onMouseOver={() => setOverTargets(true)}
          onMouseOut={() => setOverTargets(false)}
        >
          <span className={styles.title}>Search for</span>
          {searchTargets.map(target => (
            <label
              key={`search-target-${target.key}`}
              htmlFor={`search-target-input-${target.key}`}
              className={!!target.value ? styles.checked : ''}
            >
              <span>{target.label}</span>
              <input
                style={{ visibility: 'hidden' }}
                id={`search-target-input-${target.key}`}
                type="checkbox"
                value={target.label}
                checked={!!target.value}
                onChange={e => handleTargetChange(target.key, e.target.checked)}
              />
              <div className={styles.checkbox}>
                {!!target.value && <MdCheck />}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
