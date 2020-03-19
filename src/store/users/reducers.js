const initialState = {
  users: [],
};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_USERS_SUCCESS': {
      return {
        ...state,
        users: action.payload,
      };
    }
    case 'GET_USER_SUCCESS': {
      let modified, users = state.users;
      for (let i = 0, len = users.length; i < len; i++) {
        if (users[i].id === action.payload.id) {
          users[i] = action.payload;
          modified = true;
          break;
        }
      }
      if (!modified) {
        users.push(action.payload);
      }
      return {
        ...state,
        users: [ ...users ],
      };
    }
    case 'CREATE_USER_SUCCESS': {
      return {
        ...state,
        users: [ ...state.users, action.payload ],
      };
    }
    case 'UPDATE_USER_SUCCESS': {
      let users = state.users;
      for (let i = 0, len = users.length; i < len; i++) {
        if (users[i].id === action.payload.id) {
          users[i] = action.payload;
          break;
        }
      }
      return {
        ...state,
        users: [ ...users ],
      };
    }
    case 'DELETE_USER_SUCCESS': {
      let users = state.users;
      for (let i = 0, len = users.length; i < len; i++) {
        if (users[i].id === action.userId) {
          users.splice(i, 1);
          break;
        }
      }
      return {
        ...state,
        users: [ ...users ],
      };
    }
    default: {
      return state;
    }
  }
};

export default usersReducer;
