import { pushToStack } from '../index';

const initialState = {
  users: [],
  researchers: [],
  authorizedUsers: [],
};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_USERS_SUCCESS': {
      const users = pushToStack(state.users, action.payload);
      return {
        ...state,
        users: users,
      };
    }
    case 'GET_USER_SUCCESS': {
      const users = pushToStack(state.users, action.payload);
      return {
        ...state,
        users: users,
      };
    }
    case 'CREATE_USER_SUCCESS': {
      const users = pushToStack(state.users, action.payload);
      return {
        ...state,
        users: users,
      };
    }
    case 'UPDATE_USER_SUCCESS': {
      const users = pushToStack(state.users, action.payload, { updateOnly: true });
      return {
        ...state,
        users: users,
      };
    }
    case 'DELETE_USER_SUCCESS': {
      const fakeRes = { id: action.userId };
      const users = pushToStack(state.users, fakeRes, { deleteOnly: true });
      return {
        ...state,
        users: users,
      };
    }
    case 'GET_RESEARCHERS_SUCCESS': {
      const researchers = pushToStack(state.researchers, action.payload);
      return {
        ...state,
        researchers: researchers,
      };
    }
    case 'GET_AUTHORIZED_USERS_SUCCESS': {
      return state;
    }
    case 'AUTHORIZE_USER_SUCCESS': {
      return state;
    }
    default: {
      return state;
    }
  }
};

export default usersReducer;
