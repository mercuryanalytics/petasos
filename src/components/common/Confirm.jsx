import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirm.module.css';
import Modal from './Modal';
import Button from './Button';

const containerId = 'app-confirm-dialog';

const Confirm = ({ text, onConfirm }) => {
  const destroy = useCallback(() => {
    try {
      const container = document.getElementById(containerId);
      container.parentNode.removeChild(container);
    } catch (e) {}
  });

  const handleClose = useCallback(() => {
    destroy();
  });

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    destroy();
  }, [onConfirm]);

  return (
    <Modal title="Confirm action" open={true} onClose={handleClose}>
      <div className={styles.text}>{text}</div>
      <div>
        <Button onClick={handleConfirm}>Confirm</Button>
        <Button transparent onClick={handleClose}>Cancel</Button>
      </div>
    </Modal>
  );
};

export const confirm = (options) => {
  options = Object.assign({}, {
    text: '',
    onConfirm: null,
  }, options || {});

  const container = document.createElement('div');
  container.id = containerId;
  container.style.width = 0;
  container.style.height = 0;
  document.body.appendChild(container);

  ReactDOM.render(
    <Confirm text={options.text} onConfirm={options.onConfirm} />,
    container,
  );
};

export default Confirm;
