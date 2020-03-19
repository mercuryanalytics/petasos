import React from 'react';
import { useDispatch } from 'react-redux';
import styles from './UserManage.module.css';
import Button from './Button';
import { useForm, useField } from 'react-final-form-hooks';
import { Input } from './FormFields';
import { createUser, updateUser } from '../store/users/actions';

const UserManage = props => {
  const { data } = props;
  const dispatch = useDispatch();

  // @TODO Form initial values, validation
  const { form, handleSubmit, pristine, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
      email: data.email || '',
    } : {},
    validate: (values) => {
      let errors = {};
      ['name'].forEach(key => {
        if (!values[key]) {
          errors[key] = 'Field value is required.'
        }
      });
      return errors;
    },
    onSubmit: (values) => {
      const result = {
        name: values.name,
      };
      if (data) {
        dispatch(updateUser(data.id, result));
      } else {
        dispatch(createUser(result));
      }
    },
  });

  const account_name = useField('account_name', form);
  const company_name = useField('company_name', form);
  const name = useField('name', form);
  const title = useField('title', form);
  const phone = useField('phone', form);
  const fax = useField('fax', form);
  const email = useField('email', form);
  const address = useField('address', form);
  const city = useField('city', form);
  const zip_code = useField('zip_code', form);
  const country = useField('country', form);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <div className={styles.title}>
              <span>Account details</span>
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={account_name}
                label="Account name"
              />
              <Input
                className={styles.formControl}
                field={company_name}
                label="Company name"
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.title}>
              <span>Primary contact</span>
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={name}
                label="Name"
              />
              <Input
                className={styles.formControl}
                field={title}
                label="Title"
              />
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={phone}
                label="Phone number"
              />
              <Input
                className={styles.formControl}
                field={fax}
                label="Fax number"
              />
            </div>
            <Input
              className={styles.formControl}
              field={email}
              label="Email"
            />
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={address}
                label="Address"
              />
              <Input
                className={styles.formControl}
                field={city}
                label="City"
              />
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={zip_code}
                label="Zip code"
              />
              <Input
                className={styles.formControl}
                field={country}
                label="Country"
              />
            </div>
          </div>
          <div className={styles.formButtons}>
            <Button type="submit" disabled={submitting}>
              <span>{!!data ? 'Update' : 'Create'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManage;
