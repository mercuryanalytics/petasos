import { pushToStack } from '../index';

const initialState = {
  reports: [],
};

const reportsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_REPORTS_SUCCESS': {
      const reports = pushToStack(state.reports, action.payload);
      return {
        ...state,
        reports: reports,
      };
    }
    case 'GET_REPORT_SUCCESS': {
      const reports = pushToStack(state.reports, action.payload);
      return {
        ...state,
        reports: reports,
      };
    }
    case 'CREATE_REPORT_SUCCESS': {
      const reports = pushToStack(state.reports, action.payload);
      return {
        ...state,
        reports: reports,
      };
    }
    case 'UPDATE_REPORT_SUCCESS': {
      const reports = pushToStack(state.reports, action.payload, { updateOnly: true });
      return {
        ...state,
        reports: reports,
      };
    }
    case 'DELETE_REPORT_SUCCESS': {
      const fakeRes = { id: action.reportId };
      const reports = pushToStack(state.reports, fakeRes, { deleteOnly: true });
      return {
        ...state,
        reports: reports,
      };
    }
    default: {
      return state;
    }
  }
};

export default reportsReducer;
