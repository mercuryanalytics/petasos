import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getClients() {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/clients`)
      .then(res => dispatch(getClientsSuccess(res)))
      .catch(err => dispatch(getClientsFailure(err)));
  };
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
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/clients/${id}`)
      .then(res => dispatch(getClientSuccess(res)))
      .catch(err => dispatch(getClientFailure(err, id))); 
  };
}

export const getClientSuccess = (client) => {
  return {
    type: 'GET_CLIENT_SUCCESS',
    payload: client,
  }
};

export const getClientFailure = (error, clientId) => {
  return {
    type: 'GET_CLIENT_FAILURE',
    payload: error,
  }
};

export function createClient(data) {
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/clients`, { body: JSON.stringify(data) })
      .then(res => dispatch(createClientSuccess(res)))
      .catch(err => dispatch(createClientFailure(err)));
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
      .then(res => dispatch(updateClientSuccess(res)))
      .catch(err => dispatch(updateClientFailure(err, id)));
  };
}

export const updateClientSuccess = (client) => {
  return {
    type: 'UPDATE_CLIENT_SUCCESS',
    payload: client,
  }
};

export const updateClientFailure = (error, clientId) => {
  return {
    type: 'UPDATE_CLIENT_FAILURE',
    payload: error,
  }
};

export function deleteClient(id) {
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/clients/${id}`)
      .then(res => dispatch(deleteClientSuccess(id)))
      .catch(err => dispatch(deleteClientFailure(err, id)));
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
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/clients/${clientId}/domains`)
      .then(res => dispatch(getDomainsSuccess(res)))
      .catch(err => dispatch(getDomainsFailure(err)));
  };
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
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/clients/${clientId}/domains/${id}`)
      .then(res => dispatch(getDomainSuccess(res)))
      .catch(err => dispatch(getDomainFailure(err)));
  };
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
      .then(res => dispatch(createDomainSuccess(res)))
      .catch(err => dispatch(createDomainFailure(err)));
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
      .then(res => dispatch(updateDomainSuccess(res)))
      .catch(err => dispatch(updateDomainFailure(err)));
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
      .then(res => dispatch(deleteDomainSuccess(id)))
      .catch(err => dispatch(deleteDomainFailure(err, id)));
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
