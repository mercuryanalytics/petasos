import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ReportManage.module.css';
import { setLocationData } from '../store/location/actions';
import { getReport } from '../store/reports/actions';
import Button from './Button';
import { MdDelete, MdInfoOutline, MdSupervisorAccount } from 'react-icons/md';

const ReportManage = props => {
  const dispatch = useDispatch();
  const report = useSelector(state =>
    state.reportsReducer.reports.filter(r => r.id === props.id));

  useEffect(() => {
    dispatch(setLocationData({ report: props.id }));
    dispatch(getReport(props.id));
  }, [props.id]);

  const onDeleteClick = () => {};
  const onPreviewClick = () => {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          e-spres-oh > Project > Report name...
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
        <div className={styles.section}>
          <div className={styles.title}>
            <MdInfoOutline className={styles.icon} />
            Report details
          </div>
          ...
        </div>
        <div className={styles.section}>
          <div className={styles.title}>
            <MdSupervisorAccount className={styles.icon} />
            Report permissions
          </div>
          ...
        </div>
      </div>
    </div>
  );
};

export default ReportManage;
