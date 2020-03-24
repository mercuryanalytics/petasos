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
