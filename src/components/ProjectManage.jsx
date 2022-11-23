import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProjectManage.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import UserActions, { UserActionsModes, UserActionsContexts } from './UserActions';
import Button from './common/Button';
import Loader from './common/Loader';
import Scrollable from './common/Scrollable';
import { Bin, Pen } from './Icons';
import { confirm } from './common/Confirm';
import { useForm, useField } from 'react-final-form-hooks';
import { Validators, Input, Textarea, Datepicker, Select } from './FormFields';
import { getClients } from '../store/clients/actions';
import { getProject, createProject, updateProject, deleteProject } from '../store/projects/actions';
import { getResearchers, refreshAuthorizations } from '../store/users/actions';
import { UserRoles, hasRoleOnClient, hasRoleOnProject } from '../store';

const ProjectTypes = {
  MediaTest: "Media/Message Test",
  BrandLiftResearch: "Brand Lift Research",
  LiveLabs: "Live Labs",
  CustomResearch: "Custom Research",
  ConceptTest: "Concept Test",
  PitchPoll: "Pitch Poll",
  ThoughtLeadership: "Thought Leadership",
  PoliticalResearch: "Political Research",
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
  const [canDelete, setCanDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [canCreateUser, setCanCreateUser] = useState(false);
  const editMode = !!id;
  const previewMode = !editMode || !canManage;
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const data = useSelector(state =>
    editMode ? state.projectsReducer.projects.filter(p => p.id === id)[0] : null);
  const contacts = useSelector(state => state.usersReducer.researchers);
  const [contactsOptions, setContactsOptions] = useState([]);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    dispatch(getClients()).then(() => {}, () => {});
    dispatch(getResearchers()).then(() => {}, () => {});
  // eslint-disable-next-line
  }, []);

  const init = useCallback(() => {
    setIsLoading(true);
    if (!editMode) {
      setCanEdit(true);
      setIsLoading(false);
      setIsEditClicked(true);
      return;
    }
    if (id) {
      let project = data;
      let promises = !project ? [
        dispatch(getProject(id)).then((action) => (project = action.payload), () => {}),
      ] : [];
      Promise.all(promises).then(() => {
        if (project) {
          setCanEdit(
            hasRoleOnProject(user.id, id, UserRoles.ProjectManager) ||
            hasRoleOnClient(user.id, project.domain_id, UserRoles.ClientManager)
          );
          setCanManage(
            hasRoleOnProject(user.id, id, UserRoles.ProjectAdmin) ||
            hasRoleOnClient(user.id, project.domain_id, UserRoles.ClientAdmin)
          );
          setCanDelete(hasRoleOnClient(user.id, project.domain_id, UserRoles.ClientAdmin));
          setCanCreateUser(hasRoleOnClient(user.id, project.domain_id, UserRoles.ClientAdmin));
          setIsLoading(false);
          setIsEditClicked(false);
        }
      });
    }
  }, [editMode, id, user, data, dispatch, isEditClicked]);

  useEffect(init, [id]);

  useEffect(() => {
    if (contacts) {
      setContactsOptions(contacts.map(contact => ({
        value: contact.id,
        text: `${contact.contact_name} (${contact.email})`,
      })));
    }
  }, [contacts]);

  const handleDelete = useCallback(() => {
    setIsDeleteBusy(true);
    const parent = data.domain_id;
    dispatch(deleteProject(data.id)).then(() => {
      setIsDeleteBusy(false);
      history.push(Routes.ManageClient.replace(':id', parent));
    }, () => {
      setIsDeleteBusy(false);
    });
  }, [data, history, dispatch]);

  const { form, handleSubmit, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
      project_number: data.project_number || '',
      project_type: data.project_type || '',
      description: data.description || '',
      account_id: +data.account_id || '',
      updated_at: data.updated_at || '',
    } : {
      project_type: ProjectTypes.CustomResearch,
      updated_at: "",
    },
    // TODO: Now that this array has only one field, should we simplify?
    validate: (values) => {
      let errors = {};
      ['name'].forEach(key => {
        if (!Validators.hasValue(values[key])) {
          errors[key] = 'Field value is required.';
        }
      });
      return errors;
    },
    onSubmit: (values) => {
      setIsBusy(true);
      const result = {
        name: values.name,
        project_number: values.project_number,
        domain_id: editMode ? data.domain_id : clientId,
        project_type: values.project_type,
        description: values.description,
        account_id: values.account_id,
        phone: contact ? contact.contact_phone : null,
        email: contact ? contact.email : null,
      };
      if (editMode) {
        data && dispatch(updateProject(data.id, result)).then(() => {
          form.reset();
          setIsBusy(false);
        }, () => {
          setIsBusy(false);
        });
      } else {
        dispatch(createProject(result)).then(action => {
          const project = action.payload;
          const handleSuccess = () => {
            setIsBusy(false);
            history.push(Routes.ManageProject.replace(':id', project.id));
          };
          dispatch(refreshAuthorizations('project', project.id, user.id, project.domain_id))
            .then(handleSuccess, handleSuccess);
        }, () => {
          setIsBusy(false);
        });
      }
    },
  });

  const name = useField('name', form);
  const project_number = useField('project_number', form);
  const project_type = useField('project_type', form);
  const description = useField('description', form);
  const account_id = useField('account_id', form);
  const updated_at = useField('updated_at', form);

  const contact_phone = useField('contact_phone', form);
  const contact_email = useField('contact_email', form);

  useEffect(() => {
    let c = contacts.filter(c => c.id === +account_id.input.value)[0];
    setContact(!!c ? { ...c } : null);
  }, [contacts, account_id.input.value]);

  if (isLoading || (editMode && !data)) {
    return (
      <div className={`${styles.container} ${previewMode ? styles.preview : ''}`}>
        <div className={styles.loading}>
          <Loader inline className={styles.loader} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${previewMode ? styles.preview : ''}`}>
      <div className={`${styles.section} ${styles.left}`}>
        <div className={styles.project_header}>
          <div className={styles.title}>
            <span>Project details</span>
          </div>
          {editMode && !isEditClicked && (
              <div className={styles.actions}>
                {canDelete && (
                    <Button
                        transparent
                        loading={isDeleteBusy}
                        onClick={() => confirm({
                          text: 'Are you sure you want to delete this project ?',
                          onConfirm: handleDelete,
                        })}
                    >
                      <Bin className={styles.deleteIcon}/>
                      <span>{!isDeleteBusy ? 'Delete project' : 'Deleting project'}</span>
                    </Button>
                )}
                {!!canEdit && (
                    <Button transparent onClick={() => setIsEditClicked(true)}>
                      <Pen className={styles.deleteIcon}/> Edit
                    </Button>
                )}
              </div>
          )}
        </div>
        <Scrollable className={styles.scrollableForm}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              className={styles.formControl}
              field={name}
              preview={!isEditClicked}
              disabled={isBusy}
              label={`Project name ${canEdit ? '*' : ''}`}
            />
            <Input
              className={styles.formControl}
              field={project_number}
              preview={!isEditClicked}
              disabled={isBusy}
              label="Project #"
            />
            <Select
              className={styles.formControl}
              field={project_type}
              preview={!isEditClicked}
              options={projectTypesOptions}
              disabled={isBusy}
              placeholder={editMode ? 'UNASSIGNED' : 'Select a project type...'}
              label={`Project type ${canEdit ? '*' : ''}`}
            />
            <Textarea
              className={styles.formControl}
              field={description}
              preview={!isEditClicked}
              disabled={isBusy}
              label="Description"
            />
            <Select
              className={styles.formControl}
              field={account_id}
              preview={!isEditClicked}
              options={contactsOptions}
              disabled={isBusy}
              placeholder={editMode ? 'UNASSIGNED' : 'Select a research contact...'}
              label="Research contact"
            />
            {!!contact && (<>
              <Input
                className={styles.formControl}
                field={contact_phone}
                preview={true}
                value={!!contact ? contact.contact_phone : ''}
                label="Phone"
              />
              <Input
                className={styles.formControl}
                field={contact_email}
                preview={true}
                value={!!contact ? contact.email : ''}
                label="Email"
              />
            </>)}
            <Datepicker
              className={styles.formControl}
              field={updated_at}
              preview={!isEditClicked}
              disabled={true}
              maxToday={true}
              label={`Last updated`}
            />
            {canEdit && isEditClicked && (
              <div className={styles.formButtons}>
                <Button type="submit" disabled={submitting || isBusy} loading={isBusy}>
                  {editMode ? (!isBusy ? 'Update' : 'Updating') : (!isBusy ? 'Create' : 'Creating')}
                </Button>
                {editMode && (
                <Button transparent onClick={() => { form.reset(); setIsEditClicked(false) }}>
                  Cancel
                </Button>
                )}

              </div>
            )}
          </form>
        </Scrollable>
      </div>
      {editMode && canManage && (
        <div className={`${styles.section} ${styles.right}`}>
          <div className={styles.title}>
            <span>Project access</span>
          </div>
          <UserActions
            className={styles.grantActions}
            mode={UserActionsModes.Grant}
            context={UserActionsContexts.Project}
            clientId={data ? data.domain_id : clientId}
            projectId={data.id}
            canCreate={canCreateUser}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectManage;
