import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ReportManage.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import { format } from 'date-fns';
import UserActions, { UserActionsModes, UserActionsContexts } from './UserActions';
import Button from './Button';
import Loader from './Loader';
import Scrollable from './Scrollable';
import { Bin } from './Icons';
import { useForm, useField } from 'react-final-form-hooks';
import { Validators, Input, Textarea, Datepicker } from './FormFields';
import { getReport, createReport, updateReport, deleteReport } from '../store/reports/actions';
import { refreshAuthorizations } from '../store/users/actions';
import { UserRoles, hasRoleOnClient, hasRoleOnProject, hasRoleOnReport } from '../store';

const ReportManage = props => {
  const { id, projectId } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(state => state.authReducer.user);
  const [canDelete, setCanDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [canCreateUser, setCanCreateUser] = useState(false);
  const editMode = !!id;
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const data = useSelector(state =>
    editMode ? state.reportsReducer.reports.filter(r => r.id === id)[0] : null);

  const init = useCallback(() => {
    setIsLoading(true);
    if (!editMode) {
      setCanEdit(true);
      setIsLoading(false);
      return;
    }
    if (id) {
      let report = data;
      let promises = !report ? [
        dispatch(getReport(id)).then((action) => (report = action.payload), () => {}),
      ] : [];
      Promise.all(promises).then(() => {
        setCanDelete(hasRoleOnProject(user.id, report.project_id, UserRoles.ProjectManager));
        setCanEdit(
          hasRoleOnReport(user.id, id, UserRoles.ReportManager) ||
          hasRoleOnProject(user.id, report.project_id, UserRoles.ProjectManager) ||
          hasRoleOnClient(user.id, report.project.domain_id, UserRoles.ClientManager)
        );
        setCanManage(hasRoleOnReport(user.id, id, UserRoles.ReportAdmin));
        setCanCreateUser(hasRoleOnClient(user.id, report.project.domain_id, UserRoles.ClientManager));
        setIsLoading(false);
      });
    }
  }, [editMode, id, projectId, user, data]);

  useEffect(() => {
    init();
  }, [id]);

  const handleDelete = useCallback(() => {
    setIsDeleteBusy(true);
    const parent = data.project_id;
    dispatch(deleteReport(data.id)).then(() => {
      setIsDeleteBusy(false);
      history.push(Routes.ManageProject.replace(':id', parent));
    }, () => {
      setIsDeleteBusy(false);
    });
  }, [data, history]);

  const { form, handleSubmit, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
      url: data.url || '',
      description: data.description || '',
      presented_on: data.presented_on || '',
      modified_on: data.modified_on || '',
    } : {},
    validate: (values) => {
      let errors = {};
      ['name', 'modified_on'].forEach(key => {
        if (!Validators.hasValue(values[key])) {
          errors[key] = 'Field value is required.'
        }
      });
      return errors;
    },
    onSubmit: (values) => {
      setIsBusy(true);
      const result = {
        name: values.name,
        url: values.url,
        description: values.description,
        presented_on: values.presented_on ?
          format(new Date(values.presented_on), 'yyyy-MM-dd')
          : '',
        modified_on: values.modified_on ?
          format(new Date(values.modified_on), 'yyyy-MM-dd')
          : '',
        project_id: data ? data.project_id : projectId,
      };
      if (editMode) {
        data && dispatch(updateReport(data.id, result)).then(() => {
          form.reset();
          setIsBusy(false);
        }, () => {
          setIsBusy(false);
        });
      } else {
        dispatch(createReport(result)).then(action => {
          const report = action.payload;
          const handleSuccess = () => {
            setIsBusy(false);
            history.push(Routes.ManageReport.replace(':id', report.id));
          };
          dispatch(refreshAuthorizations('report', report.id, user.id, report.project.domain_id))
            .then(handleSuccess, handleSuccess);
        }, () => {
          setIsBusy(false);
        });
      }
    },
  });

  const name = useField('name', form);
  const url = useField('url', form);
  const description = useField('description', form);
  const presented_on = useField('presented_on', form);
  const modified_on = useField('modified_on', form);

  if (isLoading || (editMode && !data)) {
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
        <div className={styles.title}>
          <span>Report details</span>
        </div>
        {editMode && (
          <div className={styles.actions}>
            {canDelete && (
              <Button transparent onClick={handleDelete} loading={isDeleteBusy}>
                <Bin className={styles.deleteIcon} />
                <span>{!isDeleteBusy ? 'Delete report' : 'Deleting report'}</span>
              </Button>
            )}
            {!!data.url && (
              <Button link={data.url} target="_blank" action={true}>View report</Button>
            )}
          </div>
        )}
        <Scrollable className={styles.scrollableForm}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              className={styles.formControl}
              field={name}
              preview={!canEdit}
              disabled={isBusy}
              label={`Report name ${canEdit ? '*' : ''}`}
            />
            <Input
              className={styles.formControl}
              field={url}
              preview={!canEdit}
              disabled={isBusy}
              label="URL"
            />
            <Textarea
              className={styles.formControl}
              field={description}
              preview={!canEdit}
              disabled={isBusy}
              label="Description"
            />
            <Datepicker
              className={styles.formControl}
              field={presented_on}
              preview={!canEdit}
              disabled={isBusy}
              label="Last presented on"
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
        </Scrollable>
      </div>
      {editMode && canManage && (
        <div className={`${styles.section} ${styles.right}`}>
          <div className={styles.title}>
            <span>Report access</span>
          </div>
          <UserActions
            className={styles.grantActions}
            mode={UserActionsModes.Grant}
            context={UserActionsContexts.Report}
            clientId={data.project.domain_id}
            reportId={data.id}
            canCreate={canCreateUser}
          />
        </div>
      )}
    </div>
  );
};

export default ReportManage;
