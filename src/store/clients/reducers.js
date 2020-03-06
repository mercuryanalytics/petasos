const initialState = {
  clients: [],
};

const clientsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_CLIENTS_SUCCESS': {
      return {
        ...state,
        clients: action.payload,
      };
    }
    case 'GET_CLIENT_SUCCESS': {
      let modified, clients = state.clients;
      for (let i = 0, len = clients.length; i < len; i++) {
        if (clients[i].id === action.payload.id) {
          clients[i] = action.payload;
          modified = true;
          break;
        }
      }
      if (!modified) {
        clients.push(action.payload);
      }
      return {
        ...state,
        clients: [ ...clients ],
      };
    }
    default: {
      return state;
    }
  }
};

export default clientsReducer;
