import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ReportManage.module.css';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import { format } from 'date-fns';
import UserActions, { UserActionsModes, UserActionsContexts } from './UserActions';
import Button from './common/Button';
import Loader from './common/Loader';
import Scrollable from './common/Scrollable';
import { Bin, Pen } from './Icons';
import { confirm } from './common/Confirm';
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
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [canCreateUser, setCanCreateUser] = useState(false);
  const editMode = !!id;
  const previewMode = !editMode || !canManage;
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const data = useSelector(state =>
    editMode ? state.reportsReducer.reports.filter(r => r.id === id)[0] : null);

  const init = useCallback(() => {
    setIsLoading(true);
    if (!editMode) {
      setCanEdit(true);
      setIsEditClicked(true);
      setIsLoading(false);
      return;
    }
    if (id) {
      let report = data;
      let promises = !report ? [
        dispatch(getReport(id)).then((action) => (report = action.payload), () => {}),
      ] : [];
      Promise.all(promises).then(() => {
        if (report) {
          setCanEdit(
            hasRoleOnReport(user.id, id, UserRoles.ReportManager) ||
            hasRoleOnProject(user.id, report.project_id, UserRoles.ProjectManager) ||
            hasRoleOnClient(user.id, report.project.domain_id, UserRoles.ClientManager)
          );
          setCanManage(
            hasRoleOnReport(user.id, id, UserRoles.ReportAdmin) ||
            hasRoleOnProject(user.id, report.project_id, UserRoles.ProjectAdmin) ||
            hasRoleOnClient(user.id, report.project.domain_id, UserRoles.ClientAdmin)
          );
          setCanDelete(
            hasRoleOnProject(user.id, report.project_id, UserRoles.ProjectManager) ||
            hasRoleOnClient(user.id, report.project.domain_id, UserRoles.ClientManager)
          );
          setCanCreateUser(hasRoleOnClient(user.id, report.project.domain_id, UserRoles.ClientAdmin));
          setIsLoading(false);
          setIsEditClicked(false);
        }
      });
    }
  }, [editMode, id, user, data, dispatch, isEditClicked]);

  useEffect(() => {
    init();
  // eslint-disable-next-line
  }, [id]);

  const getAccessibleUrl = useCallback((url, name) => {
    return url.replace(/#\{report\.name\}/, name);
  }, []);

  const handleDelete = useCallback(() => {
    setIsDeleteBusy(true);
    const parent = data.project_id;
    dispatch(deleteReport(data.id)).then(() => {
      setIsDeleteBusy(false);
      history.push(Routes.ManageProject.replace(':id', parent));
    }, () => {
      setIsDeleteBusy(false);
    });
  }, [data, history, dispatch]);

  const { form, handleSubmit, submitting } = useForm({
    initialValues: data ? {
      name: data.name || '',
      url: data.url || '',
      description: data.description || '',
      presented_on: data.presented_on || '',
      updated_at: data.updated_at || '',
    } : {
      updated_at: format(new Date(), 'yyyy-MM-dd'),
    },
    validate: (values) => {
      let errors = {};
      ['name', 'updated_at'].forEach(key => {
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
        url: values.url,
        description: values.description,
        presented_on: values.presented_on ?
          format(new Date(values.presented_on), 'yyyy-MM-dd')
          : '',
        updated_at: values.updated_at ?
          format(new Date(values.updated_at), 'yyyy-MM-dd')
          : '',
        project_id: data ? data.project_id : projectId,
      };
      if (editMode) {
        data && dispatch(updateReport(data.id, result, result.project_id)).then(() => {
          form.reset();
          setIsBusy(false);
          setIsEditClicked(false);
        }, () => {
          setIsBusy(false);
        });
      } else {
        dispatch(createReport(result, result.project_id)).then(action => {
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
  const updated_at = useField('updated_at', form);

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
        <div class={styles.report_header}>
          <div className={styles.title}>
            <span>Report details</span>
          </div>
          {editMode && (
            <div className={styles.actions}>
              {canDelete && (
                <Button
                  transparent
                  loading={isDeleteBusy}
                  onClick={() => confirm({
                    text: 'Are you sure you want to delete this report ?',
                    onConfirm: handleDelete,
                  })}
                >
                  <Bin className={styles.deleteIcon} />
                  <span>{!isDeleteBusy ? 'Delete report' : 'Deleting report'}</span>
                </Button>
              )}
              {!!canEdit && !isEditClicked && (
                  <Button transparent onClick={() => setIsEditClicked(true)}>
                    <Pen className={styles.deleteIcon} /> Edit
                  </Button>
              )}
              {editMode && !previewMode && !!data.url && !isEditClicked && (
                <Button link={getAccessibleUrl(data.url, data.name)} target="_blank" action={true}>View report</Button>
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
              label={`Report name ${canEdit ? '*' : ''}`}
            />
            {canEdit && isEditClicked && (
              <Input
                className={styles.formControl}
                field={url}
                preview={!canEdit}
                disabled={isBusy}
                label="URL"
              />
            )}
            <Textarea
              className={styles.formControl}
              field={description}
              preview={!isEditClicked}
              disabled={isBusy}
              label="Description"
            />
            <Datepicker
              className={styles.formControl}
              field={presented_on}
              preview={!isEditClicked}
              disabled={isBusy}
              maxToday={true}
              label="Last presented on"
            />
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
            {editMode && previewMode && !!data.url && (
              <Button
                className={styles.viewButton}
                link={getAccessibleUrl(data.url, data.name)}
                target="_blank"
                action={true}
              >
                <span>View report</span>
              </Button>
            )}
          </form>
        </Scrollable>
      </div>
      {editMode && canManage && (
        <div className={`${styles.section} ${styles.right}`}>
          <div className={styles.title}>
            <span>Report (with Project & Client) View</span>
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
