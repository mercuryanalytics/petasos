import React, { useState } from 'react';
import styles from './ReportManage.module.css';
import UserPermissions from './UserPermissions';
import Button from './Button';
import { MdInfoOutline, MdSupervisorAccount } from 'react-icons/md';
import Form, { Input, Textarea } from './Form';

const ReportManage = props => {
  const { data, projectId } = props;
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState(null);

  const handleRequiredControlChange = (name, event) => {
    // @TODO Improve
    let value = event.target.value;
    let err = [];
    if (!String(value).length) {
      err.push('Field value is required.');
    }
    setErrors({ ...errors, [name]: err });
  };

  const handlePermissionsChange = () => {
    // @TODO Waiting for UserPermissions
  };

  const handleSubmit = () => {
    // @TODO
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles.left}`}>
        <div className={styles.title}>
          <MdInfoOutline className={styles.icon} />
          <span>Report details</span>
        </div>
        <Form
          className={styles.form}
          onInit={form => setForm(form)}
          onStatusChange={status => setStatus(status)}
          onSubmit={handleSubmit}
          formValues={data}
        >
          <Input
            className={styles.formControl}
            name="name"
            label="Report name"
            onChange={e => handleRequiredControlChange('name', e)}
            errors={errors && errors.name}
          />
          <Input
            className={styles.formControl}
            name="url"
            label="URL"
            onChange={e => handleRequiredControlChange('url', e)}
            errors={errors && errors.url}
          />
          <Textarea
            className={styles.formControl}
            name="description"
            label="Description"
            onChange={e => handleRequiredControlChange('description', e)}
            errors={errors && errors.description}
          />
          <Input
            className={styles.formControl}
            name="presented_on"
            label="Last presented on"
            onChange={e => handleRequiredControlChange('presented_on', e)}
            errors={errors && errors.presented_on}
          />
          <Input
            className={styles.formControl}
            name="modified_on"
            label="Last modified on"
            onChange={e => handleRequiredControlChange('modified_on', e)}
            errors={errors && errors.modified_on}
          />
          <div className={styles.formButtons}>
            <Button type="submit" disabled={status && status.submitting}>
              <span>{data ? 'Update' : 'Create'}</span>
            </Button>
          </div>
        </Form>
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
