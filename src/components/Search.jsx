import React, { useState, useEffect, useRef } from 'react';
import styles from './Search.module.css';
import { MdSearch, MdRadioButtonChecked, MdRadioButtonUnchecked } from 'react-icons/md';

const Search = props => {
  const { targets } = props;
  const [value, setValue] = useState('');
  const valueRef = useRef(null);
  const [targetsList, setTargetsList] = useState([]);
  const [target, setTarget] = useState(null);
  const [showTargets, setShowTargets] = useState(false);
  const [overTargets, setOverTargets] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    let list = Object.keys(targets || {});
    let selected = props.defaultTarget;
    list.forEach(targetName => {
      if (!!targets[targetName]) {
        selected = targetName;
      }
    });
    setTargetsList(list);
    setTarget(selected);
  }, []);

  useEffect(() => {
    if (isTouched &&props.onSearch) {
      props.onSearch(value, target);
    }
  }, [value, target, isTouched]);

  const handleChange = (event) => {
    setValue(event.target.value);
    setIsTouched(true);
  };

  const handleTargetChange = (targetName, checked) => {
    valueRef.current.focus();
    if (checked) {
      setTarget(targetName);
    }
  };

  return (
    <div className={styles.container}>
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
      {showTargets && !!targetsList.length && (
        <div
          className={styles.targets}
          onMouseOver={() => setOverTargets(true)}
          onMouseOut={() => setOverTargets(false)}
        >
          <span className={styles.title}>Search for</span>
          {targetsList.map((targetName, i) => (
            <label
              key={`search-target-${i}`}
              htmlFor={`search-target-input-${i}`}
              className={target === targetName ? styles.checked : ''}
            >
              <span>{targetName}</span>
              <input
                style={{ visibility: 'hidden' }}
                id={`search-target-input-${i}`}
                type="radio"
                value={targetName}
                checked={target === targetName}
                onChange={e => handleTargetChange(targetName, e.target.checked)}
              />
              {target === targetName ? <MdRadioButtonChecked /> : <MdRadioButtonUnchecked />}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
