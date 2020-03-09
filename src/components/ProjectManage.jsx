import React, { useState } from 'react';
import styles from './ProjectManage.module.css';
import UserPermissions from './UserPermissions';
import Button from './Button';
import { MdInfoOutline, MdSupervisorAccount } from 'react-icons/md';
import Form, { Input, Textarea } from './Form';

const ProjectManage = props => {
  const { data } = props;
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
    // @TODO
  };

  const handleSubmit = () => {
    // @TODO
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles.left}`}>
        <div className={styles.title}>
          <MdInfoOutline className={styles.icon} />
          <span>Project details</span>
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
            label="Project name"
            onChange={e => handleRequiredControlChange('name', e)}
            errors={errors && errors.name}
          />
          <Input
            className={styles.formControl}
            name="id"
            label="Project #"
            onChange={e => handleRequiredControlChange('id', e)}
            errors={errors && errors.id}
          />
          <Input
            className={styles.formControl}
            name="domain_id"
            label="Associated domain"
            onChange={e => handleRequiredControlChange('domain_id', e)}
            errors={errors && errors.domain_id}
          />
          <Input
            className={styles.formControl}
            name="type"
            label="Project type"
            onChange={e => handleRequiredControlChange('type', e)}
            errors={errors && errors.type}
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
            name="contact"
            label="Research contact"
            onChange={e => handleRequiredControlChange('contact', e)}
            errors={errors && errors.contact}
          />
          <Input
            className={styles.formControl}
            name="phone"
            label="Phone"
            onChange={e => handleRequiredControlChange('phone', e)}
            errors={errors && errors.phone}
          />
          <Input
            className={styles.formControl}
            name="email"
            label="Email"
            onChange={e => handleRequiredControlChange('email', e)}
            errors={errors && errors.email}
          />
          <Input
            className={styles.formControl}
            name="modified_on"
            label="Last modified on"
            onChange={e => handleRequiredControlChange('modified_on', e)}
            errors={errors && errors.modified_on}
          />
          <div className={styles.formButtons}>
            <Button type="submit" disabled={status && status.submitting}>Update</Button>
          </div>
        </Form>
      </div>
      <div className={`${styles.section} ${styles.right}`}>
        <div className={styles.title}>
          <MdSupervisorAccount className={styles.icon} />
          <span>Project permissions</span>
        </div>
        <UserPermissions onChange={handlePermissionsChange} />
      </div>
    </div>
  );
};

export default ProjectManage;
