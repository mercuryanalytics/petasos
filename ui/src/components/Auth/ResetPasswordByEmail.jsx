import React, { useState, useEffect } from 'react';
import { useForm, useField } from 'react-final-form-hooks';
import styles from './ResetPassword.module.css';
import { Validators, Input } from '../FormFields';
import Button from '../common/Button';

const ResetPasswordByEmail = props => {
  const { successMessage, error, onPasswordReset } = props;
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (successMessage || error) {
      setIsBusy(false);
    }
  }, [successMessage, error]);

  const { form, handleSubmit, submitting } = useForm({
    validate: (values) => {
      let errors = {};
      if (!Validators.hasValue(values.email)) {
        errors.email = 'Field value is required.';
      } else if (!Validators.isEmail(values.email)) {
        errors.email = 'Field value must be a valid email format.'
      }
      return errors;
    },
    onSubmit: (values) => {
      setIsBusy(true);
      if (onPasswordReset) {
        onPasswordReset(values.email);
      }
    },
  });

  const email = useField('email', form);

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.info}>
        <p>Your invitation is invalid,</p>
        <p>Please enter the email address of your account and click the button bellow to resend a new invitation.</p>
        <p>Check your inbox for the invitation and follow the instructions to access your account.</p>
      </div>
      <div className={styles.fields}>
        <Input
          className={styles.control}
          field={email}
          disabled={isBusy || submitting}
          label="Email"
        />
      </div>
      <Button
        type="submit"
        loading={isBusy || submitting}
        disabled={isBusy || submitting}
      >
        <span>{!isBusy ? 'Send email' : 'Sending email'}</span>
      </Button>
    </form>
  );
}

export default ResetPasswordByEmail;
