import React from 'react';
import { useDispatch } from 'react-redux';
import styles from './ReportManage.module.css';
import UserPermissions from './UserPermissions';
import Button from './Button';
import { MdInfoOutline, MdSupervisorAccount } from 'react-icons/md';
import { useForm, useField } from 'react-final-form-hooks';
import { Input, Textarea, Datepicker } from './Form';
import { createReport, updateReport } from '../store/reports/actions';

const ReportManage = props => {
  const { data, projectId } = props;
  const dispatch = useDispatch();

  const { form, handleSubmit, pristine, submitting } = useForm({
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
        if (!values[key]) {
          errors[key] = 'Field value is required.'
        }
      });
      return errors;
    },
    onSubmit: (values) => {
      const result = {
        name: values.name,
        url: values.url,
        description: values.description,
        presented_on: values.presented_on ?
          (new Date(values.presented_on)).toISOString()
          : '',
        modified_on: values.presented_on ?
          (new Date(values.modified_on)).toISOString()
          : '',
        project_id: projectId,
      };
      if (data) {
        dispatch(updateReport(data.id, result));
      } else {
        dispatch(createReport(result));
      }
    },
  });

  const name = useField('name', form);
  const url = useField('url', form);
  const description = useField('description', form);
  const presented_on = useField('presented_on', form);
  const modified_on = useField('modified_on', form);

  const handlePermissionsChange = () => {
    // @TODO Waiting for UserPermissions
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles.left}`}>
        <div className={styles.title}>
          <MdInfoOutline className={styles.icon} />
          <span>Report details</span>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            className={styles.formControl}
            field={name}
            label="Report name *"
          />
          <Input
            className={styles.formControl}
            field={url}
            label="URL"
          />
          <Textarea
            className={styles.formControl}
            field={description}
            label="Description"
          />
          <Datepicker
            className={styles.formControl}
            field={presented_on}
            label="Last presented on"
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
          <span>Report permissions</span>
        </div>
        <UserPermissions onChange={handlePermissionsChange} />
      </div>
    </div>
  );
};

export default ReportManage;
