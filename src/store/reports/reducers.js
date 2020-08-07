import { pushToStack, orderStack } from '../index';

const initialState = {
  reports: [],
  orphans: [],
  clientReports: [],
};

export const sortReports = (stack) => orderStack(stack, {
  descending: false,
  valueProperty: 'name',
});

const reportsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_REPORTS_SUCCESS': {
      const reports = sortReports(pushToStack(state.reports, action.payload));
      return {
        ...state,
        reports: reports,
      };
    }
    case 'GET_ORPHAN_REPORTS_SUCCESS': {
      const reports = sortReports(pushToStack(state.reports, action.payload));
      const orphans = sortReports(pushToStack(state.orphans, action.payload));
      return {
        ...state,
        reports: reports,
        orphans: orphans,
      };
    }
    case 'GET_CLIENT_REPORTS_SUCCESS': {
      const reports = sortReports(pushToStack(state.reports, action.payload));
      const clientReports = sortReports(pushToStack(state.clientReports, action.payload));
      return {
        ...state,
        reports: reports,
        clientReports: clientReports,
      };
    }
    case 'GET_REPORT_SUCCESS': {
      const reports = sortReports(pushToStack(state.reports, action.payload));
      return {
        ...state,
        reports: reports,
      };
    }
    case 'CREATE_REPORT_SUCCESS': {
      const reports = sortReports(pushToStack(state.reports, action.payload));
      return {
        ...state,
        reports: reports,
      };
    }
    case 'UPDATE_REPORT_SUCCESS': {
      const reports = sortReports(pushToStack(state.reports, action.payload, { updateOnly: true }));
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
