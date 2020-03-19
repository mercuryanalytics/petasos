import React  from 'react';
import { useDispatch } from 'react-redux';
import styles from './ClientManage.module.css';
import Button from './Button';
import { useForm, useField } from 'react-final-form-hooks';
import { Input, Select, Checkbox } from './FormFields';
import { createClient, updateClient } from '../store/clients/actions';

const ClientTypes = {
  Client: 'Client',
  Partner: 'Partner',
  Other: 'Other',
};

const clientTypesOptions = Object.keys(ClientTypes).map(key => ({
  value: ClientTypes[key],
  text: ClientTypes[key],
}));

const ClientManage = props => {
  const { data } = props;
  const dispatch = useDispatch();

  // @TODO Form initial values, validation
  const { form, handleSubmit, pristine, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
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
        dispatch(updateClient(data.id, result));
      } else {
        dispatch(createClient(result));
      }
    },
  });

  const name = useField('name', form);
  const company_name = useField('company_name', form);
  const type = useField('type', form);

  const contact_name = useField('contact_name', form);
  const contact_title = useField('contact_title', form);
  const contact_phone = useField('contact_phone', form);
  const contact_fax = useField('contact_fax', form);
  const contact_email = useField('contact_email', form);

  const mailing_address = useField('mailing_address', form);
  const mailing_city = useField('mailing_city', form);
  const mailing_zip = useField('mailing_zip', form);
  const mailing_country = useField('mailing_country', form);

  const billing_as_mailing = useField('billing_as_mailing', form);
  const billing_address = useField('billing_address', form);
  const billing_city = useField('billing_city', form);
  const billing_zip = useField('billing_zip', form);
  const billing_country = useField('billing_country', form);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <div className={styles.title}>
              <span>Name and type</span>
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={name}
                label="Client name *"
              />
              <Input
                className={styles.formControl}
                field={company_name}
                label="Company name *"
              />
            </div>
            <Select
              className={styles.formControl}
              field={type}
              options={clientTypesOptions}
              placeholder={!!data ? 'UNASSIGNED' : 'Contact type...'}
              label="Client type *"
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
                label="Name *"
              />
              <Input
                className={styles.formControl}
                field={contact_title}
                label="Title"
              />
            </div>
            <div className={styles.controlsGroup}>
              <Input
                className={styles.formControl}
                field={contact_phone}
                label="Phone number *"
              />
              <Input
                className={styles.formControl}
                field={contact_fax}
                label="Fax number"
              />
            </div>
            <Input
              className={styles.formControl}
              field={contact_email}
              label="Email *"
            />
          </div>
          <div className={styles.formSection}>
            <div className={styles.controlsGroup}>
              <div>
                <div className={`${styles.title} ${styles.mailing}`}>
                  <span>Mailing address</span>
                </div>
                <Input
                  className={styles.formControl}
                  field={mailing_address}
                  label="Address *"
                />
                <Input
                  className={styles.formControl}
                  field={mailing_city}
                  label="City *"
                />
                <Input
                  className={styles.formControl}
                  field={mailing_zip}
                  label="Zip code *"
                />
                <Input
                  className={styles.formControl}
                  field={mailing_country}
                  label="Country"
                />
              </div>
              <div>
                <div className={styles.title}>
                  <span>Billing address</span>
                </div>
                <Checkbox
                  className={styles.formControl}
                  field={billing_as_mailing}
                  label="Same as the mailing address"
                />
                <Input
                  className={styles.formControl}
                  field={billing_address}
                  disabled={!!billing_as_mailing.input.value}
                  label="Address *"
                />
                <Input
                  className={styles.formControl}
                  field={billing_city}
                  disabled={!!billing_as_mailing.input.value}
                  label="City *"
                />
                <Input
                  className={styles.formControl}
                  field={billing_zip}
                  disabled={!!billing_as_mailing.input.value}
                  label="Zip code *"
                />
                <Input
                  className={styles.formControl}
                  field={billing_country}
                  disabled={!!billing_as_mailing.input.value}
                  label="Country"
                />
              </div>
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

export default ClientManage;
