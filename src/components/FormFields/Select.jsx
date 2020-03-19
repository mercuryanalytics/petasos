import React, { useState, useEffect } from 'react';
import styles from './Select.module.css';
import { MdKeyboardArrowDown } from 'react-icons/md';

const Select = props => {
  const { field, options, label, disabled, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const classes = `
    ${styles.container}
    ${props.className}
    ${isOpen ? styles.open : ''}
    ${disabled ? styles.disabled : ''}
  `;

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

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleChange = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (field) {
      field.input.onChange(option.value);
    }
  };

  return (
    <div className={classes}>
      {!!label && (
        <label>{label}</label>
      )}
      <div className={styles.controlWrapper}>
        <select {...field.input} disabled={!!disabled} style={{ display: 'none' }}>
          {!!options && !!options.length && options.map((option, i) => (
            <option key={i} value={option.value}/>
          ))}
        </select>
        <div className={styles.control}>
          <div className={styles.trigger} onClick={handleToggle}>
            {!!selectedOption ? (
              <span>{selectedOption.text}</span>
            ) : (
              <span className={styles.placeholder}>{placeholder || 'Select...'}</span>
            )}
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
