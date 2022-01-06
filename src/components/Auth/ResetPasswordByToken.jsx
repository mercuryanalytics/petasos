import React, {useState, useEffect, useCallback} from 'react';
import styles from './ResetPassword.module.css';
import Button from '../common/Button';
import parse from "url-parse";

const ResetPasswordByEmail = props => {
  const { successMessage, error, onPasswordReset } = props;
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (successMessage || error) {
      setIsBusy(false);
    }
  }, [successMessage, error]);

  const sendEmail = useCallback(() => {
    setIsBusy(true);
    if (onPasswordReset) {
      const token = parse(window.location.href, true).query.token;
      onPasswordReset(token);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <p>Your invitation has expired,</p>
        <p>Please click the button below to resend a new invitation.</p>
        <p>Check your inbox for the invitation and follow the instructions to access your account.</p>
      </div>

      <Button
        type="submit"
        loading={isBusy}
        disabled={isBusy}
        onClick={() => sendEmail()}
      >
        <span>{!isBusy ? 'Send email' : 'Sending email'}</span>
      </Button>
    </div>
  );
}

export default ResetPasswordByEmail;
