import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Search.module.css';
import { MdSearch, MdCheck } from 'react-icons/md';

let timeout = {};

const Search = props => {
  const { id, targets, hasShadows, toggles } = props;
  const [value, setValue] = useState('');
  const valueRef = useRef(null);
  const [searchTargets, setSearchTargets] = useState(null);
  const [showTargets, setShowTargets] = useState(false);
  const [overTargets, setOverTargets] = useState(false);
  const [customToggles, setCustomToggles] = useState(null);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setSearchTargets([ ...(targets || []) ]);
  }, [targets]);

  useEffect(() => {
    setCustomToggles([ ...(toggles || []) ]);
  }, [toggles]);

  const throttleChange = useCallback((value) => {
    if (timeout[id]) {
      clearTimeout(timeout[id]);
    }
    timeout[id] = setTimeout(() => {
      setValue(value);
      setIsTouched(true);
      timeout[id] = null;
    }, 700);
  }, [id]);

  const handleChange = useCallback((event) => {
    throttleChange(event.target.value);
    event.stopPropagation();
  }, [throttleChange]);

  useEffect(() => {
    if (isTouched && props.onSearch) {
      props.onSearch(value, searchTargets);
    }
  // eslint-disable-next-line
  }, [isTouched, value, searchTargets]);

  const handleTargetChange = useCallback((targetKey, value) => {
    valueRef.current.focus();
    let newTargets = [ ...searchTargets ];
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].key === targetKey) {
        newTargets[i] = { ...newTargets[i], value: !!value };
        break;
      }
    }
    setSearchTargets(newTargets);
  }, [valueRef, targets, searchTargets]);

  const handleToggleChange = useCallback((targetKey, value) => {
    valueRef.current.focus();
    let newToggles = [ ...customToggles ];
    for (let i = 0; i < toggles.length; i++) {
      if (toggles[i].key === targetKey) {
        newToggles[i] = { ...newToggles[i], value: !!value };
        break;
      }
    }
    if (props.onToggleChange) {
      props.onToggleChange(targetKey, value);
    }
    setCustomToggles(newToggles);
  }, [valueRef, toggles, customToggles, props]);

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
          {!!customToggles && !!customToggles.length && (
            <div className={styles.toggles}>
              {customToggles.map(toggle => (
                <label
                  key={`search-toggle-${toggle.key}`}
                  htmlFor={`search-toggle-input-${toggle.key}`}
                  className={!!toggle.value ? styles.checked : ''}
                >
                  <span>{toggle.text}</span>
                  <input
                    style={{ visibility: 'hidden' }}
                    id={`search-toggle-input-${toggle.key}`}
                    type="checkbox"
                    value={toggle.text}
                    checked={!!toggle.value}
                    onChange={e => handleToggleChange(toggle.key, e.target.checked)}
                  />
                  <div className={styles.checkbox}>
                    {!!toggle.value && <MdCheck />}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
