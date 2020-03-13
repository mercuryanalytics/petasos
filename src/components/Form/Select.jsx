import React, { useState, useEffect } from 'react';
import styles from './Select.module.css';
import { MdKeyboardArrowDown } from 'react-icons/md';

const Select = props => {
  const { field, options } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const classes = `${styles.container} ${props.className} ${isOpen ? styles.open : ''}`;

  useEffect(() => {
    if (field) {
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === field.input.value) {
          setSelectedOption(options[i]);
          return;
        }
      }
    }
    setSelectedOption(null);
  }, [field]);

  const handleChange = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (field) {
      field.input.onChange(option.value);
    }
  };

  return (
    <div className={classes}>
      {!!props.label && (
        <label>{props.label}</label>
      )}
      <div className={styles.controlWrapper}>
        <select {...field.input} style={{ display: 'none' }}>
          {!!options && !!options.length && options.map((option, i) => (
            <option key={i} value={option.value}/>
          ))}
        </select>
        <div className={styles.control}>
          <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
            <span>{!!selectedOption ? selectedOption.text : (props.placeholder || 'Select...')}</span>
            <MdKeyboardArrowDown className={styles.triggerIcon} />
          </div>
          {isOpen && !!options && !!options.length && (
            <div className={styles.options}>
              {options.map((option, i) => (
                <div
                  key={i}
                  className={`
                    ${styles.option}
                    ${!!selectedOption && selectedOption.value === option.value && styles.selected}
                  `}
                  value={option.value}
                  onClick={() => handleChange(option)}
                >
                  <span>{option.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {field.meta.touched && field.meta.error && (
        <div className={styles.error}>{field.meta.error}</div>
      )}
    </div>
  );
};

export default Select;
