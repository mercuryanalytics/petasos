import { queryState } from '../index';
import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getClients() {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/clients`)
      : queryState(state => ({
        target: state.clientsReducer.clients,
      }))
  ).then(
    res => dispatch(getClientsSuccess(res)),
    err => dispatch(getClientsFailure(err)),
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

export function getClient(id) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/clients`,
      `${Constants.API_URL}/clients/${id}`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/clients/${id}`)
      : queryState(state => ({
        target: state.clientsReducer.clients,
        filters: [{ run: true, filter: item => item.id === id }],
        index: 0,
      }))
  ).then(
    res => dispatch(getClientSuccess(res)),
    err => dispatch(getClientFailure(err)),
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
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/clients`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(createClientSuccess(res)),
        err => dispatch(createClientFailure(err)),
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
  return dispatch => {
    return apiCall('PATCH', `${Constants.API_URL}/clients/${id}`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(updateClientSuccess(res)),
        err => dispatch(updateClientFailure(err)),
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
        err => dispatch(deleteClientFailure(err, id)),
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
    err => dispatch(getDomainsFailure(err)),
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
    err => dispatch(getDomainFailure(err)),
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
        err => dispatch(createDomainFailure(err)),
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
        err => dispatch(updateDomainFailure(err)),
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
        err => dispatch(deleteDomainFailure(err, id)),
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
