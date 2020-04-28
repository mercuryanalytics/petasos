import { hasValue, queryState, handleActionFailure } from '../index';
import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getReports(projectId, clientId) {
  const queryString = hasValue(projectId) ? `?project_id=${projectId}` :
    (hasValue(clientId) ? `?client_id=${clientId}` : '');
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/reports`,
      `${Constants.API_URL}/reports${queryString}`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/reports${queryString}`)
      : queryState(state => ({
        target: state.reportsReducer.reports,
        filters: [
          { run: hasValue(clientId), filter: item => item.project.domain_id === clientId },
          { run: hasValue(projectId), filter: item => item.project_id === projectId },
        ],
      }))
  ).then(
    res => dispatch(getReportsSuccess(res)),
    err => handleActionFailure(err, dispatch(getReportsFailure(err))),
  );
}

export const getReportsSuccess = (reports) => ({
  type: 'GET_REPORTS_SUCCESS',
  payload: reports,
});

export const getReportsFailure = (error) => ({
  type: 'GET_REPORTS_FAILURE',
  payload: error,
});

export function getOrphanReports() {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/reports/orphans`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/reports/orphans`)
      : queryState(state => ({
        target: state.reportsReducer.orphans,
      }))
  ).then(
    res => dispatch(getOrphanReportsSuccess(res)),
    err => handleActionFailure(err, dispatch(getOrphanReportsFailure(err))),
  );
}

export const getOrphanReportsSuccess = (reports) => ({
  type: 'GET_ORPHAN_REPORTS_SUCCESS',
  payload: reports,
});

export const getOrphanReportsFailure = (error) => ({
  type: 'GET_ORPHAN_REPORTS_FAILURE',
  payload: error,
});

export function getClientReports(clientId) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients/${clientId}/orphans`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/clients/${clientId}/orphans`)
      : queryState(state => ({
        target: state.reportsReducer.clientReports,
        filters: [{ run: true, filter: item => item.project.domain_id === clientId }],
      }))
  ).then(
    res => dispatch(getClientReportsSuccess(res)),
    err => handleActionFailure(err, dispatch(getClientReportsFailure(err))),
  );
}

export const getClientReportsSuccess = (reports) => ({
  type: 'GET_CLIENT_REPORTS_SUCCESS',
  payload: reports,
});

export const getClientReportsFailure = (error) => ({
  type: 'GET_CLIENT_REPORTS_FAILURE',
  payload: error,
});

export function getReport(id, projectId) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/reports`,
      `${Constants.API_URL}/reports/${id}`,
    ].concat(hasValue(projectId) ? [
      `${Constants.API_URL}/reports?project_id=${projectId}`,
    ] : []))
      ? apiCall('GET', `${Constants.API_URL}/reports/${id}`)
      : queryState(state => ({
        target: state.reportsReducer.reports,
        filters: [{ run: true, filter: item => item.id === id }],
        index: 0,
      }))
  ).then(
    res => dispatch(getReportSuccess(res)),
    err => handleActionFailure(err, dispatch(getReportFailure(err))),
  );
}

export const getReportSuccess = (report) => {
  return {
    type: 'GET_REPORT_SUCCESS',
    payload: report,
  }
};

export const getReportFailure = (error) => {
  return {
    type: 'GET_REPORT_FAILURE',
    payload: error,
  }
};

export function createReport(data) {
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/reports`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(createReportSuccess(res)),
        err => handleActionFailure(err, dispatch(createReportFailure(err))),
      );
  };
}

export const createReportSuccess = (report) => {
  return {
    type: 'CREATE_REPORT_SUCCESS',
    payload: report,
  }
};

export const createReportFailure = (error) => {
  return {
    type: 'CREATE_REPORT_FAILURE',
    payload: error,
  }
};

export function updateReport(id, data) {
  return dispatch => {
    return apiCall('PATCH', `${Constants.API_URL}/reports/${id}`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(updateReportSuccess(res)),
        err => handleActionFailure(err, dispatch(updateReportFailure(err))),
      );
  };
}

export const updateReportSuccess = (report) => {
  return {
    type: 'UPDATE_REPORT_SUCCESS',
    payload: report,
  }
};

export const updateReportFailure = (error) => {
  return {
    type: 'UPDATE_REPORT_FAILURE',
    payload: error,
  }
};

export function deleteReport(id) {
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/reports/${id}`)
      .then(
        res => dispatch(deleteReportSuccess(id)),
        err => handleActionFailure(err, dispatch(deleteReportFailure(err, id))),
      );
  };
}

export const deleteReportSuccess = (reportId) => {
  return {
    type: 'DELETE_REPORT_SUCCESS',
    reportId: reportId,
  }
};

export const deleteReportFailure = (error, reportId) => {
  return {
    type: 'DELETE_REPORT_FAILURE',
    payload: error,
    reportId: reportId,
  }
};
