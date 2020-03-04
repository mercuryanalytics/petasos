import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ReportManage.module.css';
import { setLocationData } from '../store/location/actions';
import { getReport } from '../store/reports/actions';

const ReportManage = props => {
  const dispatch = useDispatch();
  const report = useSelector(state =>
    state.reportsReducer.reports.filter(r => r.id === props.id));

  useEffect(() => {
    dispatch(setLocationData({ report: props.id }));
    // @TODO Remove project id ?
    dispatch(getReport(0, props.id));
  }, [props.id]);

  return (
    <div className={styles.container}>
      [ReportManage-{props.id}]
    </div>
  );
};

export default ReportManage;
