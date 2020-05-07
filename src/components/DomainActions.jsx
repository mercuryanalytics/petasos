import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './DomainActions.module.css';
import { getDomains, createDomain, deleteDomain } from '../store/clients/actions';
import { useForm, useField } from 'react-final-form-hooks';
import Loader from './Loader';
import { Bin } from './Icons';
import Modal from './Modal';
import Button from './Button';
import Scrollable from './Scrollable';
import { Validators, Input } from './FormFields';

const DomainActions = props => {
  const { clientId, canCreate, canDelete } = props;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState({});
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const domains = useSelector(state =>
    state.clientsReducer.domains.filter(d => d.client_id === clientId));

  // const handleDomainSelect = useCallback((id) => {
  //   setSelectedDomain(id);
  //   if (props.onDomainSelect) {
  //     props.onDomainSelect(id, clientId);
  //   }
  // }, [clientId, props.onDomainSelect]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getDomains(clientId)).then(() => setIsLoading(false), () => {});
  }, [clientId]);

  const handleDomainDelete = useCallback((id, event) => {
    const stopLoading = () => setIsDeleteBusy(prev => ({ ...prev, [id]: false }));
    event.stopPropagation();
    setIsDeleteBusy(prev => ({ ...prev, [id]: true }));
    dispatch(deleteDomain(id, clientId)).then(stopLoading, stopLoading);
  }, [clientId]);

  const { form, handleSubmit, submitting } = useForm({
    validate: (values) => {
      let err;
      if (!Validators.hasValue(values.add_domain_name)) {
        err = 'Field value is required.';
      }
      return err ? { add_domain_name: err } : {};
    },
    onSubmit: (values) => {
      setIsBusy(true);
      const result = {
        name: values.add_domain_name,
      };
      dispatch(createDomain(result, clientId)).then(() => {
        form.reset();
        setIsBusy(false);
        setIsAddDomainOpen(false);
      }, () => {
        setIsBusy(false);
      });
    },
  });

  const addDomainField = useField('add_domain_name', form);

  const handleAddDomainClose = useCallback(() => {
    setIsAddDomainOpen(false);
    form.reset();
  }, [form]);

  return (
    <div className={`${styles.container} ${props.className || ''}`}>
      <Modal
        className={styles.modal}
        title="Add new domain"
        open={isAddDomainOpen}
        onClose={() => handleAddDomainClose()}
      >
        <div className={styles.modalText}>
          Enter domain address.
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.modalInputContainer}>
            <span className={styles.modalInputPrefix}>@</span>
            <Input
              className={styles.modalInput}
              field={addDomainField}
            />
          </div>
          <div className={styles.modalButtons}>
            <Button type="submit" disabled={isBusy || submitting} loading={isBusy}>
              {!isBusy ? 'Add new domain' : 'Adding new domain'}
            </Button>
            <Button transparent onClick={() => handleAddDomainClose()}>
              <span>Cancel</span>
            </Button>
          </div>
        </form>
      </Modal>
      {!!canCreate && (
        <div className={styles.adders}>
          <button onClick={() => setIsAddDomainOpen(true)}>+ Add domain</button>
        </div>
      )}
      <Scrollable className={`${styles.domains} ${!canCreate ? styles.tall : ''}`}>
        {!isLoading ? (
          domains && !!domains.length ? (
            domains.map(domain => (
              <div
                key={`client-domain-${domain.id}`}
                className={`${styles.domain} ${selectedDomain === domain.id ? styles.selected : ''}`}
                title={domain.name}
                // onClick={() => handleDomainSelect(domain.id)}
              >
                <span className={styles.name}>@{domain.name}</span>
                {!!canDelete && (
                  !!isDeleteBusy[domain.id] ? (
                    <Loader inline size={3} className={styles.busyLoader} />
                  ) : (
                    <Bin
                      className={styles.delete}
                      onClick={e => handleDomainDelete(domain.id, e)}
                    />
                  )
                )}
              </div>
            ))
          ) : (
            <div className={styles.noResults}>No results</div>
          )
        ) : (
          <Loader inline className={styles.loader} />
        )}
      </Scrollable>
    </div>
  );
};

export default DomainActions;
