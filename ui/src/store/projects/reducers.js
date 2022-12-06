import { pushToStack, orderStack } from '../index';

const initialState = {
  projects: [],
  orphans: [],
};

export const sortProjects = (stack) => orderStack(stack, {
  descending: true,
  valueProperty: 'updated_at',
  valueFormatter: value => value ? +(new Date(value)) : 0,
});

const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_PROJECTS_SUCCESS': {
      const projects = sortProjects(pushToStack(state.projects, action.payload));
      return {
        ...state,
        projects: projects,
      };
    }
    case 'GET_ORPHAN_PROJECTS_SUCCESS': {
      const projects = sortProjects(pushToStack(state.projects, action.payload));
      const orphans = sortProjects(pushToStack(state.orphans, action.payload));
      return {
        ...state,
        projects: projects,
        orphans: orphans,
      };
    }
    case 'GET_PROJECT_SUCCESS': {
      const projects = sortProjects(pushToStack(state.projects, action.payload));
      return {
        ...state,
        projects: projects,
      };
    }
    case 'CREATE_PROJECT_SUCCESS': {
      const projects = sortProjects(pushToStack(state.projects, action.payload));
      return {
        ...state,
        projects: projects,
      };
    }
    case 'UPDATE_PROJECT_SUCCESS': {
      const projects = sortProjects(pushToStack(state.projects, action.payload, { updateOnly: true }));
      return {
        ...state,
        projects: projects,
      };
    }
    case 'DELETE_PROJECT_SUCCESS': {
      const fakeRes = { id: action.projectId };
      const projects = pushToStack(state.projects, fakeRes, { deleteOnly: true });
      return {
        ...state,
        projects: projects,
      };
    }
    default: {
      return state;
    }
  }
};

export default projectsReducer;
