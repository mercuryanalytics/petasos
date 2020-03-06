import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ReportManage.module.css';
import { setLocationData } from '../store/location/actions';
import { getClient } from '../store/clients/actions';
import { getProject } from '../store/projects/actions';
import { getReport } from '../store/reports/actions';
import Button from './Button';
import { MdDelete, MdInfoOutline, MdSupervisorAccount } from 'react-icons/md';
import Form, { Input, Textarea } from './Form';
import Search from './Search';

const ReportManage = props => {
  const dispatch = useDispatch();
  const report = useSelector(state =>
    state.reportsReducer.reports.filter(r => r.id === props.id)[0]);
  const project = useSelector(state => report ?
    state.projectsReducer.projects.filter(p => p.id === report.project_id)[0]
    : null);
  const client = useSelector(state => project ?
    state.clientsReducer.clients.filter(c => c.id === project.domain_id)[0]
    : null);

  useEffect(() => {
    dispatch(setLocationData({ report: props.id }));
    // if (!report || props.id !== report.id) {
    //   dispatch(getReport(props.id));
    // }
  }, [props.id]);

  // useEffect(() => {
  //   if (report && (!project || report.project_id !== project.id)) {
  //     dispatch(getProject(report.project_id));
  //   }
  // }, [report]);

  // useEffect(() => {
  //   if (project && (!client || project.domain_id !== client.id)) {
  //     dispatch(getClient(project.domain_id));
  //   }
  // }, [project]);

  const onDeleteClick = () => {};
  const onPreviewClick = () => {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          {(client && report && project) && (
            <div>{client.name} > {project.name} > {report.name}</div>
          )}
        </div>
        <div className={styles.controls}>
          <Button transparent onClick={onDeleteClick}>
            <MdDelete className={styles.deleteIcon} />
            Delete report
          </Button>
          <Button onClick={onPreviewClick}>View report</Button>
        </div>
      </div>
      <div className={styles.body}>
        <div className={`${styles.section} ${styles.left}`}>
          <div className={styles.title}>
            <MdInfoOutline className={styles.icon} />
            Report details
          </div>
          <Form className={styles.form} handleSubmit={() => console.log('submit!')}>
            <Input className={styles.formControl} name="name" placeholder="Report name" />
            <Input className={styles.formControl} name="url" placeholder="URL" />
            <Textarea className={styles.formControl} name="description" placeholder="Description" />
            <div className={styles}>
              <Input className={styles.formControl} name="lastPresented" placeholder="Last presented on" />
              <Input className={styles.formControl} name="lastModified" placeholder="Last modified on" />
            </div>
            <div className={styles.formButtons}>
              <Button type="submit">Update</Button>
            </div>
          </Form>
        </div>
        <div className={`${styles.section} ${styles.right}`}>
          <div className={styles.title}>
            <MdSupervisorAccount className={styles.icon} />
            Report permissions
          </div>
          <div className={styles.search}>
            <Search placeholder="Search user" />
          </div>
          <div className={styles.permissions}>
            <div className={styles.group}>
              <div className={styles.groupTitle}>
                > e-spres-oh
              </div>
              <div className={styles.groupItems}>
                <div className={styles.groupItem}>Russell Carter</div>
                <div className={styles.groupItem}>Allen Saunders</div>
                <div className={styles.groupItem}>Cecilia Douglas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManage;
