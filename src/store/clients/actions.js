import { queryState, handleActionFailure, hasValue } from '../index';
import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getClients(userId) {
  const queryString = hasValue(userId) ? `?user_id=${userId}` : '';
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients${queryString}`,
    ].concat(!hasValue(userId) ? [
      `${Constants.API_URL}/clients`,
    ] : []))
      ? apiCall('GET', `${Constants.API_URL}/clients${queryString}`)
      : queryState(state => ({
        target: state.clientsReducer.clients,
      }))
  ).then(
    res => dispatch(getClientsSuccess(res)),
    err => handleActionFailure(err, dispatch(getClientsFailure(err))),
  );
}

export function getClientsFromSA(userId) {
  const queryString = hasValue(userId) ? `?user_id=${userId}` : '';

  return dispatch => (
      apiCall('GET', `${Constants.API_URL}/clients${queryString}`)
  ).then(
      res => dispatch(getClientsSuccess(res)),
      err => handleActionFailure(err, dispatch(getClientsFailure(err))),
  );
}

export const getClientsSuccess = (clients) => ({
  type: 'GET_CLIENTS_SUCCESS',
  payload: clients,
});

export const getClientsFailure = (error) => ({
  type: 'GET_CLIENTS_FAILURE',
  payload: error,
});

export function getClient(id, userId) {
  const queryString = hasValue(userId) ? `?user_id=${userId}` : '';
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients/${id}${queryString}`,
    ].concat(!hasValue(userId) ? [
      `${Constants.API_URL}/clients`,
    ] : []))
      ? apiCall('GET', `${Constants.API_URL}/clients/${id}${queryString}`)
      : queryState(state => ({
        target: state.clientsReducer.clients,
        filters: [{ run: true, filter: item => item.id === id }],
        index: 0,
      }))
  ).then(
    res => dispatch(getClientSuccess(res)),
    err => handleActionFailure(err, dispatch(getClientFailure(err))),
  );
}

export const getClientSuccess = (client) => {
  return {
    type: 'GET_CLIENT_SUCCESS',
    payload: client,
  }
};

export const getClientFailure = (error) => {
  return {
    type: 'GET_CLIENT_FAILURE',
    payload: error,
  }
};

export function createClient(data) {
  const body = JSON.stringify({ client: data });
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/clients`, { body })
      .then(
        res => dispatch(createClientSuccess(res)),
        err => handleActionFailure(err, dispatch(createClientFailure(err))),
      );
  };
}

export const createClientSuccess = (client) => {
  return {
    type: 'CREATE_CLIENT_SUCCESS',
    payload: client,
  }
};

export const createClientFailure = (error) => {
  return {
    type: 'CREATE_CLIENT_FAILURE',
    payload: error,
  }
};

export function updateClient(id, data) {
  const body = JSON.stringify({ client: data });
  return dispatch => {
    return apiCall('PATCH', `${Constants.API_URL}/clients/${id}`, { body })
      .then(
        res => dispatch(updateClientSuccess(res)),
        err => handleActionFailure(err, dispatch(updateClientFailure(err))),
      );
  };
}

export const updateClientSuccess = (client) => {
  return {
    type: 'UPDATE_CLIENT_SUCCESS',
    payload: client,
  }
};

export const updateClientFailure = (error) => {
  return {
    type: 'UPDATE_CLIENT_FAILURE',
    payload: error,
  }
};

export function deleteClient(id) {
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/clients/${id}`)
      .then(
        res => dispatch(deleteClientSuccess(id)),
        err => handleActionFailure(err, dispatch(deleteClientFailure(err, id))),
      );
  };
}

export const deleteClientSuccess = (clientId) => {
  return {
    type: 'DELETE_CLIENT_SUCCESS',
    clientId: clientId,
  }
};

export const deleteClientFailure = (error, clientId) => {
  return {
    type: 'DELETE_CLIENT_FAILURE',
    payload: error,
    clientId: clientId,
  }
};

export function getTemplates(clientId) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients/${clientId}/templates`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/clients/${clientId}/templates`)
      : queryState(state => ({
        target: state.clientsReducer.templates,
        key: clientId,
      }))
  ).then(
    res => dispatch(getTemplatesSuccess(res, clientId)),
    err => handleActionFailure(err, dispatch(getTemplatesFailure(err, clientId))),
  );
}

export const getTemplatesSuccess = (templates, clientId) => ({
  type: 'GET_TEMPLATES_SUCCESS',
  payload: templates,
  clientId: clientId,
});

export const getTemplatesFailure = (error, clientId) => ({
  type: 'GET_TEMPLATES_FAILURE',
  payload: error,
  clientId: clientId,
});

export function updateTemplate(clientId, data) {
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/clients/${clientId}/templates`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(updateTemplateSuccess(res, data, clientId)),
        err => handleActionFailure(err, dispatch(updateTemplateFailure(err))),
      );
  };
}

export const updateTemplateSuccess = (domain, data, clientId) => ({
  type: 'UPDATE_TEMPLATE_SUCCESS',
  payload: domain,
  data: data,
  clientId: clientId,
});

export const updateTemplateFailure = (error) => ({
  type: 'UPDATE_TEMPLATE_FAILURE',
  payload: error,
});

export function getDomains(clientId) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients/${clientId}/domains`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/clients/${clientId}/domains`)
      : queryState(state => ({
        target: state.clientsReducer.domains,
        filters: [{ run: true, filter: item => item.client_id === clientId }],
      }))
  ).then(
    res => dispatch(getDomainsSuccess(res)),
    err => handleActionFailure(err, dispatch(getDomainsFailure(err))),
  );
}

export const getDomainsSuccess = (domains) => ({
  type: 'GET_DOMAINS_SUCCESS',
  payload: domains,
});

export const getDomainsFailure = (error) => ({
  type: 'GET_DOMAINS_FAILURE',
  payload: error,
});

export function getDomain(id, clientId) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients/${clientId}/domains`,
      `${Constants.API_URL}/clients/${clientId}/domains/${id}`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/clients/${clientId}/domains/${id}`)
      : queryState(state => ({
        target: state.clientsReducer.domains,
        filters: [{ run: true, filter: item => item.id === id }],
        index: 0,
      }))
  ).then(
    res => dispatch(getDomainSuccess(res)),
    err => handleActionFailure(err, dispatch(getDomainFailure(err))),
  );
}

export const getDomainSuccess = (domain) => ({
  type: 'GET_DOMAIN_SUCCESS',
  payload: domain,
});

export const getDomainFailure = (error) => ({
  type: 'GET_DOMAIN_FAILURE',
  payload: error,
});

export function createDomain(data, clientId) {
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/clients/${clientId}/domains`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(createDomainSuccess(res)),
        err => handleActionFailure(err, dispatch(createDomainFailure(err))),
      );
  };
}

export const createDomainSuccess = (domain) => ({
  type: 'CREATE_DOMAIN_SUCCESS',
  payload: domain,
});

export const createDomainFailure = (error) => ({
  type: 'CREATE_DOMAIN_FAILURE',
  payload: error,
});

export function updateDomain(id, data, clientId) {
  return dispatch => {
    return apiCall('PATCH', `${Constants.API_URL}/clients/${clientId}/domains/${id}`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(updateDomainSuccess(res)),
        err => handleActionFailure(err, dispatch(updateDomainFailure(err))),
      );
  };
}

export const updateDomainSuccess = (domain) => ({
  type: 'UPDATE_DOMAIN_SUCCESS',
  payload: domain,
});

export const updateDomainFailure = (error) => ({
  type: 'UPDATE_DOMAIN_FAILURE',
  payload: error,
});

export function deleteDomain(id, clientId) {
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/clients/${clientId}/domains/${id}`)
      .then(
        res => dispatch(deleteDomainSuccess(id)),
        err => handleActionFailure(err, dispatch(deleteDomainFailure(err, id))),
      );
  };
}

export const deleteDomainSuccess = (domainId) => {
  return {
    type: 'DELETE_DOMAIN_SUCCESS',
    domainId: domainId,
  }
};

export const deleteDomainFailure = (error, domainId) => {
  return {
    type: 'DELETE_DOMAIN_FAILURE',
    payload: error,
    domainId: domainId,
  }
};
