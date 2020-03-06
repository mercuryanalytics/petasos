import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProjectManage.module.css';
import { setLocationData } from '../store/location/actions';
import { getProject } from '../store/projects/actions';

const ProjectManage = props => {
  const dispatch = useDispatch();
  const project = useSelector(state =>
    state.projectsReducer.projects.filter(p => p.id === props.id));

  useEffect(() => {
    dispatch(setLocationData({ project: props.id }));
    if (!project || props.id !== project.id) {
      dispatch(getProject(props.id));
    }
  }, [props.id]);

  return (
    <div className={styles.container}>
      [ProjectManage-{props.id}]
    </div>
  );
};

export default ProjectManage;
