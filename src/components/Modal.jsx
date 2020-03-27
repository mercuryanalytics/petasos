import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';
import { MdClose } from 'react-icons/md';

const Modal = props => {
  const { open, title, background } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsTouched(true);
      if (props.onOpen) {
        props.onOpen();
      }
    } else if (props.onClose && isTouched) {
      props.onClose();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!!open !== isOpen) {
      setIsOpen(!!open);
    }
  }, [open]);

  return isOpen ? (
    <>
      {background !== false && (
        <div className={styles.container} />
      )}
      <div className={`${styles.modal} ${styles.className || ''}`}>
        <div className={styles.header}>
          {!!title && <span className={styles.title}>{title}</span>}
          <MdClose className={styles.close} onClick={() => setIsOpen(false)} />
        </div>
        {props.children}
      </div>
    </>
  ) : '';
};

export default Modal;
