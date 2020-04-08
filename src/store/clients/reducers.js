import { pushToStack } from '../index';

const initialState = {
  clients: [],
  domains: [],
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
    case 'GET_DOMAINS_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload);
      return {
        ...state,
        domains: domains,
      };
    }
    case 'GET_DOMAIN_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload);
      return {
        ...state,
        domains: domains,
      };
    }
    case 'CREATE_DOMAIN_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload);
      return {
        ...state,
        domains: domains,
      };
    }
    case 'UPDATE_DOMAIN_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload, { updateOnly: true });
      return {
        ...state,
        domains: domains,
      };
    }
    case 'DELETE_DOMAIN_SUCCESS': {
      const fakeRes = { id: action.domainId };
      const domains = pushToStack(state.domains, fakeRes, { deleteOnly: true });
      return {
        ...state,
        domains: domains,
      };
    }
    default: {
      return state;
    }
  }
};

export default clientsReducer;
