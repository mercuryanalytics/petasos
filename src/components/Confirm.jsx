import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirm.module.css';
import Modal from './Modal';

const ConfirmComponent = ({ render, onConfirm }) => {
  return (
    <Modal
      className={styles.modal}
      open={true}
      onClose={() => {}}
    />
  );
};

export const confirm = (options) => {
  options = Object.assign({}, {
    render: () => '',
    onConfirm: null,
  }, options || {});

  const container = document.createElement('div');
  container.style.width = 0;
  container.style.height = 0;
  document.body.appendChild(container);

  ReactDOM.render(
    <ConfirmComponent render={options.render} onConfirm={options.onConfirm} />,
    container,
  );
};

export default ConfirmComponent;
