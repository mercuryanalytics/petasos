import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

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
    apiCall('GET', `${Constants.API_URL}/reports/${id}`)
      .then(res => dispatch(getReportSuccess(res)))
      .catch(err => dispatch(getReportFailure(err, id)));
  };
}

export const getReportSuccess = (report) => {
  return {
    type: 'GET_REPORT_SUCCESS',
    payload: report,
  }
};

export const getReportFailure = (error, reportId) => {
  return {
    type: 'GET_REPORT_FAILURE',
    payload: error,
  }
};

export function createReport(data) {
  return dispatch => {
    apiCall('POST', `${Constants.API_URL}/reports`, { body: JSON.stringify(data) })
      .then(res => dispatch(createReportSuccess(res)))
      .catch(err => dispatch(createReportFailure(err)));
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
    apiCall('PATCH', `${Constants.API_URL}/reports/${id}`, { body: JSON.stringify(data) })
      .then(res => dispatch(updateReportSuccess(res)))
      .catch(err => dispatch(updateReportFailure(err, id)));
  };
}

export const updateReportSuccess = (report) => {
  return {
    type: 'UPDATE_REPORT_SUCCESS',
    payload: report,
  }
};

export const updateReportFailure = (error, reportId) => {
  return {
    type: 'UPDATE_REPORT_FAILURE',
    payload: error,
  }
};

export function deleteReport(id) {
  return dispatch => {
    apiCall('DELETE', `${Constants.API_URL}/reports/${id}`)
      .then(res => {dispatch(deleteReportSuccess(id))})
      .catch(err => dispatch(deleteReportFailure(err, id)));
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
