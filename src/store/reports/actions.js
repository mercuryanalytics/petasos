import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

let pending = {};

export function getReports(projectId, clientId) {
  const queryString = projectId ? `?project_id=${projectId}` :
    (clientId ? `?client_id=${clientId}` : '');
  return dispatch => {
    apiCall('GET', `${Constants.API_URL}/reports${queryString}`)
      .then(res => dispatch(getReportsSuccess(res)))
      .catch(err => dispatch(getReportsFailure(err)));
  };
}

export const getReportsSuccess = (reports) => ({
  type: 'GET_REPORTS_SUCCESS',
  payload: reports,
});

export const getReportsFailure = (error) => ({
  type: 'GET_REPORTS_FAILURE',
  payload: error,
});

export function getReport(id) {
  return dispatch => {
    if (!pending[id]) {
      pending[id] = true;
      apiCall('GET', `${Constants.API_URL}/reports/${id}`)
        .then(res => dispatch(getReportSuccess(res)))
        .catch(err => dispatch(getReportFailure(err, id)));
    }
  };
}

export const getReportSuccess = (report) => {
  pending[report.id] = false;
  return {
    type: 'GET_REPORT_SUCCESS',
    payload: report,
  }
};

export const getReportFailure = (error, reportId) => {
  pending[reportId] = false;
  return {
    type: 'GET_REPORT_FAILURE',
    payload: error,
  }
};
