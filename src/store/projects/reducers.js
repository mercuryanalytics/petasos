import { pushToStack } from '../index';

const initialState = {
  projects: [],
};

const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_PROJECTS_SUCCESS': {
      const projects = pushToStack(state.projects, action.payload);
      return {
        ...state,
        projects: projects,
      };
    }
    case 'GET_PROJECT_SUCCESS': {
      const projects = pushToStack(state.projects, action.payload);
      return {
        ...state,
        projects: projects,
      };
    }
    case 'CREATE_PROJECT_SUCCESS': {
      const projects = pushToStack(state.projects, action.payload);
      return {
        ...state,
        projects: projects,
      };
    }
    case 'UPDATE_PROJECT_SUCCESS': {
      const projects = pushToStack(state.projects, action.payload, { updateOnly: true });
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
