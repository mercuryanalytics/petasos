import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProjectManage.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import PermissionsGranter from './PermissionsGranter';
import Button from './Button';
import Loader from './Loader';
import { MdInfoOutline, MdSupervisorAccount, MdDelete } from 'react-icons/md';
import { useForm, useField } from 'react-final-form-hooks';
import { Input, Textarea, Datepicker, Select } from './FormFields';
import { getClients } from '../store/clients/actions';
import { getProject, createProject, updateProject, deleteProject } from '../store/projects/actions';
import { getResearchers } from '../store/users/actions';
import { format } from 'date-fns';

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
  const { id, clientId } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const editMode = !isNaN(id);
  const [isBusy, setIsBusy] = useState(false);
  const data = useSelector(state =>
    editMode ? state.projectsReducer.projects.filter(p => p.id === id)[0] : null);
  const clients = useSelector(state => state.clientsReducer.clients);
  const contacts = useSelector(state => state.usersReducer.researchers);

  useEffect(() => {
    dispatch(getClients());
    dispatch(getResearchers());
  }, []);

  useEffect(() => {
    if (!isNaN(id)) {
      dispatch(getProject(id));
    }
  }, [id]);

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
      setIsBusy(true);
      const result = {
        name: values.name,
        project_number: values.project_number,
        domain_id: values.domain_id,
        project_type: values.project_type,
        description: values.description,
        contact: values.contact,
        phone: values.phone,
        email: values.email,
        modified_on: values.modified_on ?
          format(new Date(values.modified_on), 'yyyy-MM-dd')
          : '',
      };
      if (data) {
        dispatch(updateProject(data.id, result)).then(() => {
          form.reset();
          setIsBusy(false);
        });
      } else {
        dispatch(createProject(result)).then(action => {
          setIsBusy(false);
          if (action.payload) {
            history.push(Routes.ManageProject.replace(':id', action.payload.id));
          }
        });
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
    if (clients) {
      setDomainsOptions(clients.map(domain => ({
        value: domain.id,
        text: domain.name,
      })));
    }
  }, [clients]);

  useEffect(() => {
    if (contacts) {
      setContactsOptions(contacts.map(contact => ({
        value: contact.id,
        text: contact.email,
      })));
    }
  }, [contacts]);

  const handleDelete = () => {
    const parent = data.domain_id;
    dispatch(deleteProject(data.id)).then(() => {
      history.push(Routes.ManageClient.replace(':id', parent));
    });;
  };

  return (!editMode || (editMode && data)) && clients ? (
    <div className={styles.container}>
      <div className={styles.actions}>
        <Button transparent onClick={handleDelete}>
          <MdDelete className={styles.deleteIcon} />
          <span>Delete project</span>
        </Button>
      </div>
      <div className={`${styles.section} ${styles.left}`}>
        <div className={styles.title}>
          <MdInfoOutline className={styles.icon} />
          <span>Project details</span>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            className={styles.formControl}
            field={name}
            disabled={isBusy}
            label="Project name *"
          />
          <Input
            className={styles.formControl}
            field={project_number}
            disabled={isBusy}
            label="Project #"
          />
          <Select
            className={styles.formControl}
            field={domain_id}
            options={domainsOptions}
            disabled={isBusy}
            placeholder="Select a domain..."
            label="Associated domain"
          />
          <Select
            className={styles.formControl}
            field={project_type}
            options={projectTypesOptions}
            disabled={isBusy}
            placeholder={editMode ? 'UNASSIGNED' : 'Select a project type...'}
            label="Project type"
          />
          <Textarea
            className={styles.formControl}
            field={description}
            disabled={isBusy}
            label="Description"
          />
          <Select
            className={styles.formControl}
            field={contact}
            options={contactsOptions}
            disabled={isBusy}
            placeholder={editMode ? 'UNASSIGNED' : 'Select a research contact...'}
            label="Research contact"
          />
          <Input
            className={styles.formControl}
            field={phone}
            disabled={isBusy}
            label="Phone"
          />
          <Input
            className={styles.formControl}
            field={email}
            disabled={isBusy}
            label="Email"
          />
          <Datepicker
            className={styles.formControl}
            field={modified_on}
            disabled={isBusy}
            label="Last modified on *"
          />
          <div className={styles.formButtons}>
            <Button type="submit" disabled={submitting || isBusy}>
              <span>{editMode ? (!isBusy ? 'Update' : 'Updating') : (!isBusy ? 'Create' : 'Creating')}</span>
              {isBusy && <Loader inline size={3} className={styles.busyLoader} />}
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
  ) : (
    <Loader inline className={styles.loader} />
  );
};

export default ProjectManage;
