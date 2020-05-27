import React, { useState, useEffect, useCallback } from 'react';
import styles from './Login.module.css';
import { useForm, useField } from 'react-final-form-hooks';
import { Validators, Input } from '../FormFields';
import Button from '../common/Button';

export const LoginViewTypes = {
  Login: 'login',
  Reset: 'reset',
};

const Login = props => {
  const {
    socialConnectors, loginError, passwordResetError,
    onLogin, onSocialLogin, onPasswordReset, onViewChange,
  } = props;
  const [view, setView] = useState(LoginViewTypes.Login);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (loginError || passwordResetError) {
      setIsBusy(false);
    }
  }, [loginError, passwordResetError]);

  const { form, handleSubmit, submitting } = useForm({
    validate: (values) => {
      let errors = {};
      if (view === LoginViewTypes.Reset) {
        if (!Validators.hasValue(values.reset_user)) {
          errors.reset_user = 'Field value is required.';
        } else if (!Validators.isEmail(values.reset_user)) {
          errors.reset_user = 'Field value must be a valid email format.';
        }
      } else {
        ['user', 'password'].forEach(key => {
          if (!Validators.hasValue(values[key])) {
            errors[key] = 'Field value is required.';
          }
          if (!errors.user && !Validators.isEmail(values.user)) {
            errors.user = 'Field value must be a valid email format.';
          }
        });
      }
      return errors;
    },
    onSubmit: (values) => {
      setIsBusy(true);
      if (view === LoginViewTypes.Reset) {
        if (onPasswordReset) {
          onPasswordReset(values.reset_user);
        }
      } else if (onLogin) {
        onLogin(values.user, values.password);
      }
    },
  });

  const user = useField('user', form);
  const password = useField('password', form);
  const reset_user = useField('reset_user', form);

  const switchView = useCallback((type) => {
    if (!isBusy && !submitting) {
      if (onViewChange) {
        onViewChange(type);
      }
      form.reset();
      setView(type);
    }
  }, [form, isBusy, submitting]);

  const renderSocialConnectorLogo = useCallback((logo) => {
    if (typeof logo === 'string' || logo instanceof String) {
      return <img src={logo} />;
    }
    return logo();
  });

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      {(view === LoginViewTypes.Login && (<>
        {!!socialConnectors && !!socialConnectors.length && (<>
          <div className={styles.connectors}>
            {socialConnectors.map(connector => (
              <div
                key={connector.type}
                className={styles.connector}
                onClick={() => onSocialLogin && onSocialLogin(connector)}
              >
                {renderSocialConnectorLogo(connector.logo)}
                <span>Sign in with {connector.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.separator}>
            <span>or</span>
          </div>
        </>)}
        <div className={styles.loginSection}>
          <Input
            className={styles.control}
            field={user}
            disabled={isBusy || submitting}
            label="Email"
          />
          <Input
            className={`${styles.control} ${styles.nopad}`}
            field={password}
            type="password"
            disabled={isBusy || submitting}
            label="Password"
          />
          <div className={styles.passwordReset}>
            <span onClick={() => switchView(LoginViewTypes.Reset)}>Forgot password?</span>
          </div>
        </div>
      </>)) ||
      (view === LoginViewTypes.Reset && (<>
        <div className={styles.resetSection}>
          <Input
            className={`${styles.control} ${styles.nopad}`}
            field={reset_user}
            disabled={isBusy || submitting}
            label="Email"
          />
        </div>
      </>))}
      <div className={styles.buttons}>
        {(view === LoginViewTypes.Login && (
          <Button
            type="submit"
            loading={isBusy || submitting}
            disabled={isBusy || submitting}
          >
            <span>{!isBusy ? 'Log In' : 'Logging In'}</span>
          </Button>
        )) ||
        (view === LoginViewTypes.Reset && (<>
          <Button
            type="submit"
            loading={isBusy || submitting}
            disabled={isBusy || submitting}
          >
            <span>{!isBusy ? 'Send Email' : 'Sending Email'}</span>
          </Button>
          <Button
            transparent
            disabled={isBusy || submitting}
            onClick={() => switchView(LoginViewTypes.Login)}
          >
            <span>Cancel</span>
          </Button>
        </>))}
      </div>
    </form>
  );
}

export default Login;
