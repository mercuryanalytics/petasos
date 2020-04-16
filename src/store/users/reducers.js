import { pushToStack, UserRolesWriteToRead } from '../index';

const initialState = {
  users: [],
  researchers: [],
  authorizedUsers: {},
  scopes: {},
  authorizations: {},
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
      const { userId, contextId, clientId, projectId, reportId, states, isGlobal } = action;
      let key, resType, resId, role, roleStatus;
      let authorizedUsers = state.authorizedUsers;
      let authorizations = state.authorizations;
      if (!isGlobal) {
        if (reportId) {
          key = `report-${reportId}@${contextId}`;
          resType = 'report';
          resId = reportId;
        } else if (projectId) {
          key = `project-${projectId}@${contextId}`;
          resType = 'project';
          resId = projectId;
        } else if (clientId) {
          key = `client-${clientId}@${contextId}`;
          resType = 'client';
          resId = clientId;
        }
        if (states.role) {
          role = states.role;
          roleStatus = states.role_state;
          if (authorizations.hasOwnProperty(userId)) {
            let data = authorizations[userId];
            if (data.hasOwnProperty(resType)) {
              let resData = data[resType];
              for (let i = 0; i < resData.length; i++) {
                let a = resData[i];
                const newAuthorization = [

                ];
                if (a[0].subject_id === resId && a[1] === UserRolesWriteToRead[role]) {
                  data = { ...data };
                  data[resType][i] = [ ...data[resType][i], ...newAuthorization ];
                  authorizations = {
                    ...authorizations,
                    [userId]: {
                      ...authorizations[userId],
                      [resType]: [ ...data[resType] ],
                    },
                  };
                  break;
                }
              }
            }
          }
        } else {
          if (authorizedUsers.hasOwnProperty(key)) {
            let data = authorizedUsers[key];
            for (let i = 0; i < data.length; i++) {
              let user = data[i];
              if (user.id === userId) {
                data = [ ...data ];
                data[i] = { ...user, authorized: !!states.authorized };
                authorizedUsers = {
                  ...authorizedUsers,
                  [key]: data,
                };
                break;
              }
            }
          }
        }
      } else {
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
