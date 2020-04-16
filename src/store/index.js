import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './auth/reducers';
import usersReducer from './users/reducers';
import clientsReducer from './clients/reducers';
import projectsReducer from './projects/reducers';
import reportsReducer from './reports/reducers';
import locationReducer from './location/reducers';

export const pushToStack = (stack, data, options) => {
  if (!data) {
    return stack;
  }

  data = Array.isArray(data) ? data : [data];
  options = Object.assign({}, {
    updateOnly: false,
    deleteOnly: false,
  }, options);

  const restricted = options.updateOnly || options.deleteOnly;
  const resIdToStackIndex = {};

  stack.forEach((stackRes, index) => {
    resIdToStackIndex[stackRes.id] = index;
  });

  let pushedIds = {};

  data.forEach(res => {
    if (pushedIds.hasOwnProperty(res.id)) {
      return;
    }
    if (resIdToStackIndex.hasOwnProperty(res.id)) {
      const index = resIdToStackIndex[res.id];
      if (options.deleteOnly) {
        stack = [ ...stack ];
        stack.splice(index, 1);
      } else {
        stack = [ ...stack ];
        stack[index] = { ...stack[index], ...res };
      }
    } else if (!restricted) {
      stack = [ ...stack, { ...res } ];
    }
    pushedIds[res.id] = true;
  });

  return stack;
};

export const filterStackBy = (stack, criteria, values) => {
  criteria = Array.isArray(criteria) ? criteria : [criteria];
  return stack.filter(item => {
    return values.indexOf(item[criteria]) > -1;
  });
};

export const UserRoles = {
  ClientManager: 'client_manager',
  ClientAdmin: 'client_admin',
  ProjectManager: 'project_manager',
  ProjectAdmin: 'project_admin',
  ReportManager: 'report_manager',
  ReportAdmin: 'report_admin',
};

export const UserRolesWriteToRead = {
  [UserRoles.ClientManager]: 'client_editor',
  [UserRoles.ClientAdmin]: 'client_admin',
  [UserRoles.ProjectManager]: 'project_editor',
  [UserRoles.ProjectAdmin]: 'project_admin',
  [UserRoles.ReportManager]: 'report_editor',
  [UserRoles.ReportAdmin]: 'report_admin',
};

export const isUserAuthorized = (authorizations, userId, resType, resId, role, scopeId, isGlobal) => {
  for (let i in authorizations) {
    if (userId === +i) {
      const userAuthorizations = authorizations[userId];
      if (scopeId && isGlobal) {
        const scopes = userAuthorizations.global;
        if (scopes && scopes.indexOf(scopeId) > -1) {
          return true;
        }
      } else if (userAuthorizations.hasOwnProperty(resType)) {
        const resAuthorizations = userAuthorizations[resType];
        for (let k = 0; k < resAuthorizations.length; k++) {
          const a = resAuthorizations[k];
          if (a[0].subject_id !== resId) {
            continue;
          }
          if (role && a[1] === UserRolesWriteToRead[role]) {
            return true;
          }
          if (scopeId) {
            const scopes = a[2];
            for (let j = 0; j < scopes.length; j++) {
              if (scopes[j].id === scopeId) {
                return true;
              }
            }
          }
          if (!role && !scopeId) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

export default createStore(combineReducers({
  authReducer,
  usersReducer,
  clientsReducer,
  projectsReducer,
  reportsReducer,
  locationReducer,
}), applyMiddleware(thunk));
