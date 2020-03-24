import { pushToStack } from '../index';

const initialState = {
  clients: [],
};

const clientsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_CLIENTS_SUCCESS': {
      const clients = pushToStack(state.clients, action.payload);
      return {
        ...state,
        clients: clients,
      };
    }
    case 'GET_CLIENT_SUCCESS': {
      const clients = pushToStack(state.clients, action.payload);
      return {
        ...state,
        clients: clients,
      };
    }
    case 'CREATE_CLIENT_SUCCESS': {
      const clients = pushToStack(state.clients, action.payload);
      return {
        ...state,
        clients: clients,
      };
    }
    case 'UPDATE_CLIENT_SUCCESS': {
      const clients = pushToStack(state.clients, action.payload, { updateOnly: true });
      return {
        ...state,
        clients: clients,
      };
    }
    case 'DELETE_CLIENT_SUCCESS': {
      const fakeRes = { id: action.clientId };
      const clients = pushToStack(state.clients, fakeRes, { deleteOnly: true });
      return {
        ...state,
        clients: clients,
      };
    }
    default: {
      return state;
    }
  }
};

export default clientsReducer;
