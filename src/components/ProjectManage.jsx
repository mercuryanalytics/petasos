import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './ProjectManage.module.css';
import PermissionsGranter from './PermissionsGranter';
import Button from './Button';
import { MdInfoOutline, MdSupervisorAccount } from 'react-icons/md';
import { useForm, useField } from 'react-final-form-hooks';
import { Input, Textarea, Datepicker, Select } from './FormFields';
import { createProject, updateProject } from '../store/projects/actions';

const ProjectTypes = {
  CommercialTest: 'Commercial Test',
  ConsumerTest: 'Consumer Test',
  CoverTest: 'Cover Test',
  MessagingTest: 'Messaging Test',
  PoliticalAdTest: 'Political Ad Test',
  PrintAdTest: 'Print Ad Test',
  TrailerTest: 'Trailer Test',
  VideoTest: 'Video Test',
  WebsiteEvaluationTest: 'Website Evaluation Test',
  CustomTest: 'Custom Test',
};

const projectTypesOptions = Object.keys(ProjectTypes).map(key => ({
  value: ProjectTypes[key],
  text: ProjectTypes[key],
}));

const ProjectManage = props => {
  // @TODO Pass 'contacts'
  const { data, clientId, domains, contacts } = props;
  const dispatch = useDispatch();

  const { form, handleSubmit, pristine, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
      project_number: data.project_number || '',
      domain_id: data.domain_id || '',
      project_type: data.project_type || '',
      description: data.description || '',
      contact: data.contact || '',
      phone: data.phone || '',
      email: data.email || '',
      modified_on: data.modified_on || '',
    } : {},
    validate: (values) => {
      let errors = {};
      ['name', 'modified_on'].forEach(key => {
        if (!values[key]) {
          errors[key] = 'Field value is required.'
        }
      });
      return errors;
    },
    onSubmit: (values) => {
      const result = {
        name: values.name,
        project_number: values.project_number,
        domain_id: values.domain_id,
        project_type: values.project_type,
        description: values.description,
        contact: values.contact,
        phone: values.phone,
        email: values.email,
        modified_on: values.presented_on ?
          (new Date(values.modified_on)).toISOString()
          : '',
      };
      if (data) {
        dispatch(updateProject(data.id, result));
      } else {
        dispatch(createProject(result));
      }
    },
  });

  const name = useField('name', form);
  const project_number = useField('project_number', form);
  const domain_id = useField('domain_id', form);
  const project_type = useField('project_type', form);
  const description = useField('description', form);
  const contact = useField('contact', form);
  const phone = useField('phone', form);
  const email = useField('email', form);
  const modified_on = useField('modified_on', form);

  const [domainsOptions, setDomainsOptions] = useState([]);
  const [contactsOptions, setContactsOptions] = useState([]);

  useEffect(() => {
    if (domains) {
      setDomainsOptions(domains.map(domain => ({
        value: domain.id,
        text: domain.name,
      })));
    }
  }, [domains]);

  useEffect(() => {
    if (contacts) {
      setContactsOptions(contacts.map(contact => ({
        value: contact.id,
        text: contact.name,
      })));
    }
  }, [contact]);

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles.left}`}>
        <div className={styles.title}>
          <MdInfoOutline className={styles.icon} />
          <span>Project details</span>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            className={styles.formControl}
            field={name}
            label="Project name *"
          />
          <Input
            className={styles.formControl}
            field={project_number}
            label="Project #"
          />
          <Select
            className={styles.formControl}
            field={domain_id}
            options={domainsOptions}
            placeholder="Select a domain..."
            label="Associated domain"
          />
          <Select
            className={styles.formControl}
            field={project_type}
            options={projectTypesOptions}
            placeholder={!!data ? 'UNASSIGNED' : 'Select a project type...'}
            label="Project type"
          />
          <Textarea
            className={styles.formControl}
            field={description}
            label="Description"
          />
          <Select
            className={styles.formControl}
            field={contact}
            options={contactsOptions}
            placeholder={!!data ? 'UNASSIGNED' : 'Select a research contact...'}
            label="Research contact"
          />
          <Input
            className={styles.formControl}
            field={phone}
            label="Phone"
          />
          <Input
            className={styles.formControl}
            field={email}
            label="Email"
          />
          <Datepicker
            className={styles.formControl}
            field={modified_on}
            label="Last modified on *"
          />
          <div className={styles.formButtons}>
            <Button type="submit" disabled={submitting}>
              <span>{!!data ? 'Update' : 'Create'}</span>
            </Button>
          </div>
        </form>
      </div>
      <div className={`${styles.section} ${styles.right}`}>
        <div className={styles.title}>
          <MdSupervisorAccount className={styles.icon} />
          <span>Project permissions</span>
        </div>
        <PermissionsGranter />
      </div>
    </div>
  );
};

export default ProjectManage;
