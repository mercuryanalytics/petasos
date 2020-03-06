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
      let modified, reports = state.reports;
      for (let i = 0, len = reports.length; i < len; i++) {
        if (reports[i].id === action.payload.id) {
          reports[i] = action.payload;
          modified = true;
          break;
        }
      }
      if (!modified) {
        reports.push(action.payload);
      }
      return {
        ...state,
        reports: [ ...reports ],
      };
    }
    default: {
      return state;
    }
  }
};

export default reportsReducer;
