import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getReports(projectId) {
  return dispatch => {
    apiCall('GET', `${Constants.API_URL}/projects/${projectId}/reports`)
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

// @TODO Keep project id ?
export function getReport(projectId, id) {
  return dispatch => {
    apiCall('GET', `${Constants.API_URL}/projects/${projectId}/reports/${id}`)
      .then(res => dispatch(getReportSuccess(res)))
      .catch(err => dispatch(getReportFailure(err)));
  };
}

export const getReportSuccess = (report) => ({
  type: 'GET_REPORT_SUCCESS',
  payload: report,
});

export const getReportFailure = (error) => ({
  type: 'GET_REPORT_FAILURE',
  payload: error,
});
