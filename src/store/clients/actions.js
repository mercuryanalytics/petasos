import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

let pending = {};

export function getClients() {
  return dispatch => {
    apiCall('GET', `${Constants.API_URL}/clients`)
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
    if (!pending[id]) {
      pending[id] = true;
      apiCall('GET', `${Constants.API_URL}/clients/${id}`)
        .then(res => dispatch(getClientSuccess(res)))
        .catch(err => dispatch(getClientFailure(err, id))); 
    }
  };
}

export const getClientSuccess = (client) => {
  pending[client.id] = false;
  return {
    type: 'GET_CLIENT_SUCCESS',
    payload: client,
  }
};

export const getClientFailure = (error, clientId) => {
  pending[clientId] = false;
  return {
    type: 'GET_CLIENT_FAILURE',
    payload: error,
  }
};
