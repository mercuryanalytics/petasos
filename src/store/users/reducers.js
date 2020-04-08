import { pushToStack } from '../index';

const initialState = {
  users: [],
  researchers: [],
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
    case 'GET_AUTHORIZED_USERS_SUCCESS': {
      const { contextId, clientId, projectId, reportId } = action;
      const key = (reportId ? `report-${reportId}`
        : (projectId ? `project-${projectId}` : `client-${clientId}`)) + `@${contextId}`;
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
      const { userId, contextId, clientId, projectId, reportId, status } = action;
      const key = (reportId ? `report-${reportId}` :
        (projectId ? `project-${projectId}` : `client-${clientId}`)) + `@${contextId}`;
      if (state.authorizedUsers.hasOwnProperty(key)) {
        let data = state.authorizedUsers[key];
        for (let i = 0; i < data.length; i++) {
          let user = data[i];
          if (user.id === userId) {
            data = [ ...data ];
            data[i] = { ...user, authorized: status };
            return {
              ...state,
              authorizedUsers: {
                ...state.authorizedUsers,
                [key]: data,
              },
            }
          }
        }
      }
      return state;
    }
    default: {
      return state;
    }
  }
};

export default usersReducer;
