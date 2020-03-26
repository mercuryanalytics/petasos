import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ClientManage.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import Button from './Button';
import Loader from './Loader';
import PermissionsGranter, { PermissionsGranterModes } from './PermissionsGranter';
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
  const [isBusy, setIsBusy] = useState(false);
  const clients = useSelector(state =>
    editMode ? state.clientsReducer.clients : null);
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
      mailing_zip: data.mailing_zip || '',
      mailing_state: data.mailing_state || '',
      mailing_country: data.mailing_country || '',
      billing_address_1: data.billing_address_1 || '',
      billing_city: data.billing_city || '',
      billing_zip: data.billing_zip || '',
      billing_state: data.billing_state || '',
      billing_country: data.billing_country || '',
    } : {},
    validate: (values) => {
      let errors = {};
      [
        'name', 'company_name', 'contact_type',
        'contact_name', 'contact_phone', 'contact_email',
        'mailing_address_1', 'mailing_city', 'mailing_zip', 'mailing_state',
        'billing_address_1', 'billing_city', 'billing_zip', 'billing_state',
      ].forEach(key => {
        if (!values[key]) {
          errors[key] = 'Field value is required.'
        }
      });
      return errors;
    },
    onSubmit: (values) => {
      setIsBusy(true);
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
        mailing_zip: values.mailing_zip,
        mailing_state: values.mailing_state,
        mailing_country: values.mailing_country,
        billing_address_1: values.billing_address_1,
        billing_city: values.billing_city,
        billing_zip: values.billing_zip,
        billing_state: values.billing_state,
        billing_country: values.billing_country,
      };
      if (data) {
        dispatch(updateClient(data.id, result)).then(() => {
          form.reset();
          setIsBusy(false);
        });
      } else {
        dispatch(createClient(result)).then(action => {
          setIsBusy(false);
          if (action.payload) {
            history.push(Routes.ManageClient.replace(':id', action.payload.id));
          }
        });
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
  const mailing_country = useField('mailing_country', form);

  const billing_as_mailing = useField('billing_as_mailing', form);
  const billing_address_1 = useField('billing_address_1', form);
  const billing_city = useField('billing_city', form);
  const billing_zip = useField('billing_zip', form);
  const billing_state = useField('billing_state', form);
  const billing_country = useField('billing_country', form);

  const [billingAsMailing, setBillingAsMailing] = useState(false);
  const [billingDefaults, setBillingDefaults] = useState({});
  
  useEffect(() => {
    setBillingDefaults(data ? {
      billing_address_1: data.billing_address_1 || '',
      billing_city: data.billing_city || '',
      billing_zip: data.billing_zip || '',
      billing_state: data.billing_state || '',
      billing_country: data.billing_country || '',
    } : {});
  }, [data]);

  useEffect(() => {
    const status = billing_as_mailing.input.value;
    if (status) {
      setBillingDefaults({
        billing_address_1: billing_address_1.input.value,
        billing_city: billing_city.input.value,
        billing_zip: billing_zip.input.value,
        billing_state: billing_state.input.value,
        billing_country: billing_country.input.value,
      });
    }
    setBillingAsMailing(!!status);
  }, [billing_as_mailing.input.value]);

  const [activeTab, setActiveTab] = useState(ContentTabs.Details);

  const handleDelete = () => {
    let redirectToId;
    if (clients.length > 1) {
      for (let i = 0; i < clients.length; i++) {
        if (clients[i].id === data.id) {
          redirectToId = clients[i > 0 ? i-1 : i+1].id;
        }
      }
    }
    dispatch(deleteClient(data.id)).then(() => {
      if (redirectToId) {
        history.push(Routes.ManageClient.replace(':id', redirectToId));
      } else {
        history.push(Routes.CreateClient);
      }
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
      {(activeTab === ContentTabs.Details && (
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
                  disabled={isBusy}
                  label="Client name *"
                />
                <Input
                  className={styles.formControl}
                  field={company_name}
                  disabled={isBusy}
                  label="Company name *"
                />
              </div>
              <Select
                className={styles.formControl}
                field={contact_type}
                options={clientTypesOptions}
                disabled={isBusy}
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
                  disabled={isBusy}
                  label="Name *"
                />
                <Input
                  className={styles.formControl}
                  field={contact_title}
                  disabled={isBusy}
                  label="Title"
                />
              </div>
              <div className={styles.controlsGroup}>
                <Input
                  className={styles.formControl}
                  field={contact_phone}
                  disabled={isBusy}
                  label="Phone number *"
                />
                <Input
                  className={styles.formControl}
                  field={contact_fax}
                  disabled={isBusy}
                  label="Fax number"
                />
              </div>
              <Input
                className={styles.formControl}
                field={contact_email}
                disabled={isBusy}
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
                    disabled={isBusy}
                    label="Address *"
                  />
                  <Input
                    className={styles.formControl}
                    field={mailing_city}
                    disabled={isBusy}
                    label="City *"
                  />
                  <Input
                    className={styles.formControl}
                    field={mailing_state}
                    disabled={isBusy}
                    label="State *"
                  />
                  <Input
                    className={styles.formControl}
                    field={mailing_zip}
                    disabled={isBusy}
                    label="Zip code *"
                  />
                  <Input
                    className={styles.formControl}
                    field={mailing_country}
                    disabled={isBusy}
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
                    disabled={isBusy}
                    label="Same as the mailing address"
                  />
                  <Input
                    className={styles.formControl}
                    field={billing_address_1}
                    disabled={isBusy || billingAsMailing}
                    value={billingAsMailing ? mailing_address_1.input.value : (billingDefaults.billing_address_1 || '')}
                    label="Address *"
                  />
                  <Input
                    className={styles.formControl}
                    field={billing_city}
                    disabled={isBusy || billingAsMailing}
                    value={billingAsMailing ? mailing_city.input.value : (billingDefaults.billing_city || '')}
                    label="City *"
                  />
                  <Input
                    className={styles.formControl}
                    field={billing_state}
                    disabled={isBusy || billingAsMailing}
                    value={billingAsMailing ? mailing_state.input.value : (billingDefaults.billing_state || '')}
                    label="State *"
                  />
                  <Input
                    className={styles.formControl}
                    field={billing_zip}
                    disabled={isBusy || billingAsMailing}
                    value={billingAsMailing ? mailing_zip.input.value : (billingDefaults.billing_zip || '')}
                    label="Zip code *"
                  />
                  <Input
                    className={styles.formControl}
                    field={billing_country}
                    disabled={isBusy || billingAsMailing}
                    value={billingAsMailing ? mailing_country.input.value : (billingDefaults.billing_country || '')}
                    label="Country"
                  />
                </div>
              </div>
            </div>
            <div className={styles.formButtons}>
              <Button type="submit" disabled={submitting || isBusy}>
                <span>{editMode ? (!isBusy ? 'Update' : 'Updating') : (!isBusy ? 'Create' : 'Creating')}</span>
                {isBusy && <Loader inline size={3} className={styles.busyLoader} />}
              </Button>
            </div>
          </form>
        </div>
      )) ||
      (activeTab === ContentTabs.Accounts && (
        <div className={`${styles.section}`}>
          <div className={`${styles.title} ${styles.big}`}>
            <span>Users</span>
          </div>
          <PermissionsGranter mode={PermissionsGranterModes.Manage} clientId={data.id} />
        </div>
      )) ||
      (activeTab === ContentTabs.Defaults && (
        <div className={`${styles.section}`}>ClientDefaults</div>
      ))}
    </div>
  ) : (
    <Loader inline className={styles.loader} />
  );
};

export default ClientManage;
