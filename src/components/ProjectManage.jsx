import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProjectManage.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import UserActions, { UserActionsModes, UserActionsContexts } from './UserActions';
import Button from './Button';
import Loader from './Loader';
import { MdDelete } from 'react-icons/md';
import { useForm, useField } from 'react-final-form-hooks';
import { Input, Textarea, Datepicker, Select } from './FormFields';
import { getClients } from '../store/clients/actions';
import { getProject, createProject, updateProject, deleteProject } from '../store/projects/actions';
import { getResearchers } from '../store/users/actions';
import { format } from 'date-fns';
import { UserRoles, hasRoleOnClient, hasRoleOnProject } from '../store';

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
  const user = useSelector(state => state.authReducer.user);
  const [canEdit, setCanEdit] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const editMode = !!id;
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const data = useSelector(state =>
    editMode ? state.projectsReducer.projects.filter(p => p.id === id)[0] : null);
  const clients = useSelector(state => state.clientsReducer.clients);
  const contacts = useSelector(state => state.usersReducer.researchers);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    dispatch(getClients());
    dispatch(getResearchers());
  }, []);

  const init = useCallback(() => {
    setIsLoading(true);
    if (!editMode) {
      setCanEdit(true);
      setIsLoading(false);
      return;
    }
    if (id) {
      dispatch(getProject(id)).then((action) => {
        setCanEdit(
          hasRoleOnProject(user.id, id, UserRoles.ProjectManager) ||
          hasRoleOnClient(user.id, action.payload.domain_id, UserRoles.ClientManager),
        );
        setCanManage(hasRoleOnProject(user.id, id, UserRoles.ProjectAdmin));
        setIsLoading(false);
      });
    }
  }, [editMode, id, clientId, user]);

  useEffect(() => {
    init();
  }, [id]);

  const { form, handleSubmit, pristine, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
      project_number: data.project_number || '',
      domain_id: data.domain_id || '',
      project_type: data.project_type || '',
      description: data.description || '',
      account_id: +data.account_id || '',
      phone: contact ? (contact.contact_phone || '') : '',
      email: contact ? (contact.email || '') : '',
      modified_on: data.modified_on || '',
    } : {
      project_type: ProjectTypes.CommercialTest,
    },
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
        account_id: values.account_id,
        phone: values.phone,
        email: values.email,
        modified_on: values.modified_on ?
          format(new Date(values.modified_on), 'yyyy-MM-dd')
          : '',
      };
      if (editMode) {
        data && dispatch(updateProject(data.id, result)).then(() => {
          form.reset();
          setIsBusy(false);
        });
      } else {
        dispatch(createProject(result)).then(action => {
          setIsBusy(false);
          history.push(Routes.ManageProject.replace(':id', action.payload.id));
        });
      }
    },
  });

  const name = useField('name', form);
  const project_number = useField('project_number', form);
  const domain_id = useField('domain_id', form);
  const project_type = useField('project_type', form);
  const description = useField('description', form);
  const account_id = useField('account_id', form);
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

  useEffect(() => {
    let c = contacts.filter(c => c.id === +account_id.input.value)[0];
    setContact(c || null);
  }, [contacts, account_id.input.value, form]);

  const handleDelete = () => {
    setIsDeleteBusy(true);
    const parent = data.domain_id;
    dispatch(deleteProject(data.id)).then(() => {
      setIsDeleteBusy(false);
      history.push(Routes.ManageClient.replace(':id', parent));
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader inline className={styles.loader} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles.left}`}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.title}>
            <span>Project details</span>
          </div>
          {editMode && (
            <div className={styles.actions}>
              {canEdit && (
                <Button transparent onClick={handleDelete} loading={isDeleteBusy}>
                  <MdDelete className={styles.deleteIcon} />
                  <span>{!isDeleteBusy ? 'Delete project' : 'Deleting project'}</span>
                </Button>
              )}
            </div>
          )}
          <Input
            className={styles.formControl}
            field={name}
            preview={!canEdit}
            disabled={isBusy}
            label={`Project name ${canEdit ? '*' : ''}`}
          />
          <Input
            className={styles.formControl}
            field={project_number}
            preview={!canEdit}
            disabled={isBusy}
            label="Project #"
          />
          <Select
            className={styles.formControl}
            field={domain_id}
            preview={!canEdit}
            options={domainsOptions}
            disabled={isBusy}
            placeholder="Select a client..."
            label="Associated client"
          />
          <Select
            className={styles.formControl}
            field={project_type}
            preview={!canEdit}
            options={projectTypesOptions}
            disabled={isBusy}
            placeholder={editMode ? 'UNASSIGNED' : 'Select a project type...'}
            label={`Project type ${canEdit ? '*' : ''}`}
          />
          <Textarea
            className={styles.formControl}
            field={description}
            preview={!canEdit}
            disabled={isBusy}
            label="Description"
          />
          <Select
            className={styles.formControl}
            field={account_id}
            preview={!canEdit}
            options={contactsOptions}
            disabled={isBusy}
            placeholder={editMode ? 'UNASSIGNED' : 'Select a research contact...'}
            label="Research contact"
          />
          <Input
            className={styles.formControl}
            field={phone}
            preview={!canEdit}
            disabled={true}
            value={!!contact ? contact.contact_phone : ''}
            label="Phone"
          />
          <Input
            className={styles.formControl}
            field={email}
            preview={!canEdit}
            disabled={true}
            value={!!contact ? contact.email : ''}
            label="Email"
          />
          <Datepicker
            className={styles.formControl}
            field={modified_on}
            preview={!canEdit}
            disabled={isBusy}
            label={`Last modified on ${canEdit ? '*' : ''}`}
          />
          {canEdit && (
            <div className={styles.formButtons}>
              <Button type="submit" disabled={submitting || isBusy} loading={isBusy}>
                {editMode ? (!isBusy ? 'Update' : 'Updating') : (!isBusy ? 'Create' : 'Creating')}
              </Button>
            </div>
          )}
        </form>
      </div>
      {editMode && canManage && (
        <div className={`${styles.section} ${styles.right}`}>
          <div className={styles.title}>
            <span>Project access</span>
          </div>
          <UserActions
            mode={UserActionsModes.Grant}
            context={UserActionsContexts.Project}
            clientId={data ? data.domain_id : clientId}
            projectId={data.id}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectManage;
