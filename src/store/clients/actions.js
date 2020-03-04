import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

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

export const getClient = (id) => ({
  type: 'GET_CLIENT',
  payload: {},
});

export const getClientSuccess = (client) => ({
  type: 'GET_CLIENT_SUCCESS',
  payload: client,
});

export const getClientFailure = (error) => ({
  type: 'GET_CLIENT_FAILURE',
  payload: error,
});
