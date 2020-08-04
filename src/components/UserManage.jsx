import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './UserManage.module.css';
import Loader from './common/Loader';
import Button from './common/Button';
import Scrollable from './common/Scrollable';
import { Pen } from './Icons';
import { useForm, useField } from 'react-final-form-hooks';
import { Validators, Input } from './FormFields';
import { getUser, createUser, updateUser } from '../store/users/actions';

const UserManage = props => {
  const { id, embeded, preview, clientId, canEdit, disableAccountChange } = props;
  const dispatch = useDispatch();
  const editMode = !!id;
  const previewMode = !embeded;
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isEditClicked, setIsEditClicked] = useState(false);
  const data = useSelector(state =>
    editMode ? state.usersReducer.users.filter(u => u.id === id)[0] : null);

  useEffect(() => {
    setIsEditClicked(false);
    if (!!id && (!data || data.id !== !!id)) {
      setIsLoading(true);
      dispatch(getUser(id)).then(() => setIsLoading(false), () => {});
    }
  // eslint-disable-next-line
  }, [id]);

  const { form, handleSubmit, submitting } = useForm({
    initialValues: data ? {
      email: data.email || '',
      contact_name: data.contact_name || '',
      contact_title: data.contact_title || '',
      contact_phone: data.contact_phone || '',
      contact_fax: data.contact_fax || '',
      // contact_email: data.contact_email || '',
      mailing_address_1: data.mailing_address_1 || '',
      mailing_city: data.mailing_city || '',
      mailing_state: data.mailing_state || '',
      mailing_zip: data.mailing_zip || '',
      mailing_country: data.mailing_country || '',
    } : {},
    validate: (values) => {
      let errors = {};
      let requiredFields = [
        'email', 'contact_name', 'contact_phone', /* 'contact_email', */
        'mailing_address_1', 'mailing_city', 'mailing_state', 'mailing_zip',
      ];
      requiredFields.forEach(key => {
        if (!Validators.hasValue(values[key])) {
          errors[key] = 'Field value is required.';
        }
      });
      if (!errors.email && !Validators.isEmail(values.email)) {
        errors.email = 'Field value must be a valid email format.';
      }
      // if (!errors.contact_email && !Validators.isEmail(values.contact_email)) {
      //   errors.contact_email = 'Field value must be a valid email format.';
      // }
      return errors;
    },
    onSubmit: (values) => {
      setIsBusy(true);
      const result = {
        email: values.email,
        contact_name: values.contact_name,
        contact_title: values.contact_title,
        contact_phone: values.contact_phone,
        contact_fax: values.contact_fax,
        // contact_email: values.contact_email,
        mailing_address_1: values.mailing_address_1,
        mailing_city: values.mailing_city,
        mailing_state: values.mailing_state,
        mailing_zip: values.mailing_zip,
        mailing_country: values.mailing_country,
      };
      if (values.new_password) {
        result.password = values.new_password;
      }
      if (clientId) {
        result.client_id = clientId;
      }
      if (editMode) {
        data && dispatch(updateUser(data.id, result)).then(() => {
          form.reset();
          setIsBusy(false);
        }, () => {
          setIsBusy(false);
        });
      } else {
        dispatch(createUser(result)).then(() => {
          setIsBusy(false);
        }, () => {
          setIsBusy(false);
        });
      }
    },
  });

  const email = useField('email', form);
  const contact_name = useField('contact_name', form);
  const contact_title = useField('contact_title', form);
  const contact_phone = useField('contact_phone', form);
  const contact_fax = useField('contact_fax', form);
  // const contact_email = useField('contact_email', form);
  const mailing_address_1 = useField('mailing_address_1', form);
  const mailing_city = useField('mailing_city', form);
  const mailing_state = useField('mailing_state', form);
  const mailing_zip = useField('mailing_zip', form);
  const mailing_country = useField('mailing_country', form);

  const renderRequiredFieldLabel = (label) => (
    <>{label}{!preview || isEditClicked ? ' *' : ''}</>
  );

  return !isLoading ? (
    <div className={`${styles.container} ${embeded ? styles.embed : ''} ${previewMode ? styles.preview : ''}`}>
      {!embeded && (
        <div className={`${styles.title} ${styles.big}`}>
          <span>My account</span>
        </div>
      )}
      {preview && !isEditClicked && !!canEdit && (
        <Button className={styles.editButton} transparent onClick={() => setIsEditClicked(true)}>
          Edit <Pen />
        </Button>
      )}
      <Scrollable className={styles.section}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <div className={styles.title}>
              <span>Account details</span>
            </div>
            <Input
              className={styles.formControl}
              field={email}
              disabled={!!disableAccountChange}
              preview={preview && !isEditClicked}
              label={renderRequiredFieldLabel('Account name')}
            />
          </div>
          <div className={styles.formSection}>
            <div className={styles.title}>
              <span>Primary contact</span>
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={contact_name}
                preview={preview && !isEditClicked}
                label={renderRequiredFieldLabel('Name')}
              />
              <Input
                className={styles.formControl}
                field={contact_title}
                preview={preview && !isEditClicked}
                label="Title"
              />
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={contact_phone}
                preview={preview && !isEditClicked}
                label={renderRequiredFieldLabel('Phone number')}
              />
              <Input
                className={styles.formControl}
                field={contact_fax}
                preview={preview && !isEditClicked}
                label="Fax number"
              />
            </div>
            {/* <Input
              className={styles.formControl}
              field={contact_email}
              preview={preview && !isEditClicked}
              label={renderRequiredFieldLabel('Email')}
            /> */}
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={mailing_address_1}
                preview={preview && !isEditClicked}
                label={renderRequiredFieldLabel('Address')}
              />
              <Input
                className={styles.formControl}
                field={mailing_city}
                preview={preview && !isEditClicked}
                label={renderRequiredFieldLabel('City')}
              />
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={mailing_state}
                preview={preview && !isEditClicked}
                label={renderRequiredFieldLabel('State')}
              />
              <Input
                className={styles.formControl}
                field={mailing_zip}
                preview={preview && !isEditClicked}
                label={renderRequiredFieldLabel('Zip code')}
              />
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={mailing_country}
                preview={preview && !isEditClicked}
                label="Country"
              />
            </div>
          </div>
          {/* {(!preview || isEditClicked) && !embeded && (
            <div className={`${styles.formSection} ${styles.passwordSection}`}>
              <div className={styles.title}>
                <span>Reset password</span>
              </div>
              <a className={styles.passwordLink} href="#">
                <span>Send me a reset password link</span>
              </a>
            </div>
          )} */}
          {(!preview || isEditClicked) && (
            <div className={styles.formButtons}>
              <Button type="submit" disabled={submitting} loading={isBusy}>
                {editMode ? (!isBusy ? 'Update' : 'Updating') : (!isBusy ? 'Create' : 'Creating')}
              </Button>
            </div>
          )}
        </form>
      </Scrollable>
    </div>
  ) : (
    <Loader inline className={styles.loader} />
  );
};

export default UserManage;
