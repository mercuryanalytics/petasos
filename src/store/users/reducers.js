import { pushToStack } from '../index';

const initialState = {
  users: [],
  researchers: [],
  scopes: {},
  authorizations: {},
  authorizedUsers: {},
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
    case 'GET_SCOPES_SUCCESS': {
      return {
        ...state,
        scopes: { ...state.scopes, ...action.payload },
      };
    }
    case 'GET_USER_AUTHORIZATIONS_SUCCESS': {
      return {
        ...state,
        authorizations: {
          ...state.authorizations,
          [action.userId]: action.payload,
        },
      };
    }
    case 'GET_MY_AUTHORIZATIONS_SUCCESS': {
      return {
        ...state,
        authorizations: {
          ...state.authorizations,
          [action.userId]: action.payload,
        },
      };
    }
    case 'GET_AUTHORIZED_USERS_SUCCESS': {
      const { contextId, resPath, resId } = action;
      const resType = resPath ? resPath.slice(0, -1) : '';
      const key = `${resType}-${resId}@${contextId}`;
      const result = pushToStack((state.authorizedUsers[key] || []), action.payload);
      return {
        ...state,
        authorizedUsers: {
          ...state.authorizedUsers,
          [key]: result,
        },
      };
    }
    case 'AUTHORIZE_USER_SUCCESS': {
      let authorizedUsers = state.authorizedUsers;
      let authorizations = state.authorizations;
      const { userId, contextId, resPath, resId, states, isGlobal } = action;
      const resType = resPath ? resPath.slice(0, -1) : '';
      const authorizedKey = `${resType}-${resId}@${contextId}`;
      if (!isGlobal) {
        if (states.hasOwnProperty('authorized')) {
          if (authorizedUsers.hasOwnProperty(authorizedKey)) {
            let data = authorizedUsers[authorizedKey];
            for (let i = 0; i < data.length; i++) {
              let user = data[i];
              if (user.id === userId) {
                data = [ ...data ];
                data[i] = { ...user, authorized: !!states.authorized };
                authorizedUsers = {
                  ...authorizedUsers,
                  [authorizedKey]: data,
                };
                break;
              }
            }
          }
        }
      }
      return {
        ...state,
        authorizedUsers: authorizedUsers,
        authorizations: authorizations,
      };
    }
    default: {
      return state;
    }
  }
};

export default usersReducer;
