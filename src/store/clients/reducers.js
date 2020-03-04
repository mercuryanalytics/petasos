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
      let modified;
      for (let i, len = state.clients.length; i < len; i++) {
        if (+state.clients[i].id === +action.payload.id) {
          state.clients[i] = action.payload;
          modified = true;
          break;
        }
      }
      if (!modified) {
        state.clients.push(action.payload);
      }
    }
    default: {
      return state;
    }
  }
};

export default clientsReducer;
