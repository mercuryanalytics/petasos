const initialState = {
  reports: [],
};

const reportsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_REPORTS_SUCCESS': {
      return {
        ...state,
        reports: action.payload,
      };
    }
    case 'GET_REPORT_SUCCESS': {
      let modified;
      for (let i = 0, len = state.reports.length; i < len; i++) {
        if (state.reports[i].id === action.payload.id) {
          state.reports[i] = action.payload;
          modified = true;
          break;
        }
      }
      if (!modified) {
        state.reports.push(action.payload);
      }
      return state;
    }
    default: {
      return state;
    }
  }
};

export default reportsReducer;
