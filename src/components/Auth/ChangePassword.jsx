import React, { useState, useEffect } from 'react';
import styles from './ChangePassword.module.css';
import { useForm, useField } from 'react-final-form-hooks';
import { Validators, Input } from '../FormFields';
import Button from '../common/Button';

const ChangePassword = props => {
  const { error, onPasswordChange } = props;
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (error) {
      setIsBusy(false);
    }
  }, [error]);

  const { form, handleSubmit, submitting } = useForm({
    validate: (values) => {
      let errors = {};
      ['password', 'confirm_password'].forEach(key => {
        if (!Validators.hasValue(values[key])) {
          errors[key] = 'Field value is required.';
        }
      });
      if (values.password !== values.confirm_password) {
        errors.confirm_password = 'Field value doesn\'t match password.';
      }
      // @TODO Add more password validations
      return errors;
    },
    onSubmit: (values) => {
      setIsBusy(true);
      if (onPasswordChange) {
        onPasswordChange(values.password);
      }
    },
  });

  const password = useField('password', form);
  const confirm_password = useField('confirm_password', form);

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <Input
          className={styles.control}
          field={password}
          disabled={isBusy || submitting}
          label="New password"
        />
        <Input
          className={`${styles.control} ${styles.nopad}`}
          field={confirm_password}
          disabled={isBusy || submitting}
          label="Confirm new password"
        />
      </div>
      <Button
        type="submit"
        loading={isBusy || submitting}
        disabled={isBusy || submitting}
      >
        <span>{!isBusy ? 'Change Password' : 'Changing password'}</span>
      </Button>
    </form>
  );
}

export default ChangePassword;
