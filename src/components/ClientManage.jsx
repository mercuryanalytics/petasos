import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ClientManage.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import Button from './Button';
import Loader from './Loader';
import { MdDelete } from 'react-icons/md';
import { useForm, useField } from 'react-final-form-hooks';
import { Input, Select, Checkbox } from './FormFields';
import { getClient, createClient, updateClient, deleteClient } from '../store/clients/actions';

const ClientTypes = {
  Client: 'Client',
  Partner: 'Partner',
  Other: 'Other',
};

const clientTypesOptions = Object.keys(ClientTypes).map(key => ({
  value: ClientTypes[key],
  text: ClientTypes[key],
}));

const ContentTabs = {
  Details: 1,
  Accounts: 2,
  Defaults: 3,
};

const ClientManage = props => {
  const { id } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const editMode = !isNaN(id);
  const data = useSelector(state =>
    editMode ? state.clientsReducer.clients.filter(c => c.id === id)[0] : null);

  useEffect(() => {
    if (!isNaN(id)) {
      dispatch(getClient(id));
    }
  }, [id]);

  const { form, handleSubmit, pristine, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
      company_name: data.company_name || '',
      contact_type: data.contact_type || '',
      contact_name: data.contact_name || '',
      contact_title: data.contact_title || '',
      contact_phone: data.contact_phone || '',
      contact_fax: data.contact_fax || '',
      contact_email: data.contact_email || '',
      mailing_address_1: data.mailing_address_1 || '',
      mailing_city: data.mailing_city || '',
      mailing_state: data.mailing_state || '',
      mailing_zip: data.mailing_zip || '',
      billing_address_1: data.billing_address_1 || '',
      billing_city: data.billing_city || '',
      billing_state: data.billing_state || '',
      billing_zip: data.billing_zip || '',
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
      const useBilling = !values.billing_as_mailing;
      const result = {
        name: values.name,
        company_name: values.company_name,
        contact_type: values.contact_type,
        contact_name: values.contact_name,
        contact_title: values.contact_title,
        contact_phone: values.contact_phone,
        contact_fax: values.contact_fax,
        contact_email: values.contact_email,
        mailing_address_1: values.mailing_address_1,
        mailing_city: values.mailing_city,
        mailing_state: values.mailing_state,
        mailing_zip: values.mailing_zip,
        billing_address_1: useBilling ? values.billing_address_1 : values.mailing_address_1,
        billing_city: useBilling ? values.billing_city : values.mailing_city,
        billing_state: useBilling ? values.billing_state : values.mailing_state,
        billing_zip: useBilling ? values.billing_zip : values.mailing_zip,
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
  const contact_type = useField('contact_type', form);

  const contact_name = useField('contact_name', form);
  const contact_title = useField('contact_title', form);
  const contact_phone = useField('contact_phone', form);
  const contact_fax = useField('contact_fax', form);
  const contact_email = useField('contact_email', form);

  const mailing_address_1 = useField('mailing_address_1', form);
  const mailing_city = useField('mailing_city', form);
  const mailing_zip = useField('mailing_zip', form);
  const mailing_state = useField('mailing_state', form);

  const billing_as_mailing = useField('billing_as_mailing', form);
  const billing_address_1 = useField('billing_address_1', form);
  const billing_city = useField('billing_city', form);
  const billing_zip = useField('billing_zip', form);
  const billing_state = useField('billing_state', form);

  const [activeTab, setActiveTab] = useState(ContentTabs.Details);

  const handleDelete = () => {
    dispatch(deleteClient(data.id)).then(() => {
      // @TODO Move to sibling project ?
      // history.push(Routes.ManageClient.replace(':id', id));
      history.push(Routes.Home);
    });
  };

  return !editMode || (editMode && data) ? (
    <div className={styles.container}>
      <div className={styles.actions}>
        <Button transparent onClick={handleDelete}>
          <MdDelete className={styles.deleteIcon} />
          <span>Delete client</span>
        </Button>
      </div>
      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${activeTab === ContentTabs.Details ? styles.active : ''}`}
          onClick={() => setActiveTab(ContentTabs.Details)}
        >
          <span>Client details</span>
        </div>
        <div
          className={`${styles.tab} ${activeTab === ContentTabs.Accounts ? styles.active : ''}`}
          onClick={() => setActiveTab(ContentTabs.Accounts)}
        >
          <span>Accounts</span>
        </div>
        <div
          className={`${styles.tab} ${activeTab === ContentTabs.Defaults ? styles.active : ''}`}
          onClick={() => setActiveTab(ContentTabs.Defaults)}
        >
          <span>Defaults</span>
        </div>
      </div>
      <div className={`${styles.section}`}>
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
              field={contact_type}
              options={clientTypesOptions}
              placeholder={editMode ? 'UNASSIGNED' : 'Contact type...'}
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
                  field={mailing_address_1}
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
                  field={mailing_state}
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
                  field={billing_address_1}
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
                  field={billing_state}
                  disabled={!!billing_as_mailing.input.value}
                  label="Country"
                />
              </div>
            </div>
          </div>
          <div className={styles.formButtons}>
            <Button type="submit" disabled={submitting}>
              <span>{editMode ? 'Update' : 'Create'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <Loader inline className={styles.loader} />
  );
};

export default ClientManage;
