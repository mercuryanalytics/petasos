const initialState = {
  projects: [],
};

const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_PROJECTS_SUCCESS': {
      return {
        ...state,
        projects: action.payload,
      };
    }
    case 'GET_PROJECT_SUCCESS': {
      let modified, projects = state.projects;
      for (let i = 0, len = projects.length; i < len; i++) {
        if (projects[i].id === action.payload.id) {
          projects[i] = action.payload;
          modified = true;
          break;
        }
      }
      if (!modified) {
        projects.push(action.payload);
      }
      return {
        ...state,
        projects: [ ...projects ],
      };
    }
    case 'CREATE_PROJECT_SUCCESS': {
      return {
        ...state,
      };
    }
    case 'UPDATE_PROJECT_SUCCESS': {
      return {
        ...state,
      };
    }
    case 'DELETE_PROJECT_SUCCESS': {
      return {
        ...state,
      };
    }
    default: {
      return state;
    }
  }
};

export default projectsReducer;
