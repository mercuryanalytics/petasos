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
      let modified;
      for (let i, len = state.projects.length; i < len; i++) {
        if (+state.projects[i].id === +action.payload.id) {
          state.projects[i] = action.payload;
          modified = true;
          break;
        }
      }
      if (!modified) {
        state.projects.push(action.payload);
      }
    }
    default: {
      return state;
    }
  }
};

export default projectsReducer;
