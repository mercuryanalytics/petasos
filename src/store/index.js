import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './auth/reducers';
import locationReducer from './location/reducers';
import usersReducer from './users/reducers';
import clientsReducer from './clients/reducers';
import projectsReducer from './projects/reducers';
import reportsReducer from './reports/reducers';
import apiCall from '../utils/api-call';

const store = createStore(combineReducers({
  authReducer,
  locationReducer,
  usersReducer,
  clientsReducer,
  projectsReducer,
  reportsReducer,
}), applyMiddleware(thunk));

export const ResourceTypes = {
  Client: 'client',
  Project: 'project',
  Report: 'report',
};

export const UserRoles = {
  ClientManager: 'client_manager',
  ClientAdmin: 'client_admin',
  ProjectManager: 'project_manager',
  ProjectAdmin: 'project_admin',
  ReportManager: 'report_manager',
  ReportAdmin: 'report_admin',
  Viewer: 'viewer',
};

export const UserRolesWriteToRead = {
  [UserRoles.ClientManager]: 'client_editor',
  [UserRoles.ClientAdmin]: 'client_admin',
  [UserRoles.ProjectManager]: 'project_editor',
  [UserRoles.ProjectAdmin]: 'project_admin',
  [UserRoles.ReportManager]: 'report_editor',
  [UserRoles.ReportAdmin]: 'report_admin',
  [UserRoles.Viewer]: 'viewer',
};

export const clearCache = () => {
  apiCall.forgetAll();
};

export const handleActionFailure = (err) => {
  return Promise.reject(err);
};

export const hasValue = (source) => {
  return typeof source !== 'undefined' && source !== null;
};

export const filterStack = (stack, filters) => {
  if (!Array.isArray(stack)) {
    return stack;
  }

  filters = Array.isArray(filters) ? filters : [];
  let finalFilters = [];

  filters.forEach(filter => {
    if (filter.run) {
      finalFilters.push(filter);
    }
  });

  return !finalFilters.length ? stack : stack.filter(item => {
    for (let i = 0; i < finalFilters.length; i++) {
      if (finalFilters[i].filter(item, i)) {
        return true;
      }
    }
    return false;
  });
};

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

export const queryState = async (callback) => {
  let target, filters, index, key;
  let error;

  try {
    const setup = callback(store.getState());
    target = setup.target;
    filters = setup.filters;
    index = setup.index;
    key = setup.key;
  } catch (e) {
    error = e;
  }

  return new Promise((resolve, reject) => {
    let result;
    if (!error) {
      if (target) {
        result = Array.isArray(filters) ? filterStack(target, filters) : target;
        if (typeof index !== 'undefined' && index !== null) {
          result = typeof result[index] !== 'undefined' ? result[index] : null;
        }
        if (typeof key !== 'undefined' && key !== null) {
          result = typeof result[key] !== 'undefined' ? result[key] : null;
        }
      }
      if (!result) {
        error = new Error('No state query results');
      }
    }
    return !error ? resolve(result) : reject(error);
  });
};

export const isUserAuthorized = (authorizations, userId, resType, resId, role, scopeId, isGlobal) => {
  for (let i in authorizations) {
    if (userId === +i) {
      const userAuthorizations = authorizations[userId];
      if (scopeId && isGlobal) {
        const scopes = userAuthorizations.global;
        for (let j = 0; j < scopes.length; j++) {
          if (Array.isArray(scopeId)) {
            const [scopeBranch, scopeAction] = scopeId;
            if (scopes[j].scope === scopeBranch && scopes[j].action === scopeAction) {
              return true;
            }
          } else if (scopes[j].id === scopeId) {
            return true;
          }
        }
      } else if (userAuthorizations.hasOwnProperty(resType)) {
        const resAuthorizations = userAuthorizations[resType];
        for (let k = 0; k < resAuthorizations.length; k++) {
          const a = resAuthorizations[k];
          if (a[0].subject_id !== resId) {
            continue;
          }
          if (role && (Array.isArray(a[1]) ? a[1] : [a[1]]).indexOf(UserRolesWriteToRead[role]) > -1) {
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

const getAuthorizations = () => {
  try {
    return store.getState().usersReducer.authorizations || {};
  } catch (e) {
    return {};
  }
};

export const isSuperUser = (userId) => {
  return isUserAuthorized(getAuthorizations(), userId, null, null, null, ['admin', 'admin'], true);
};

export const isResearcher = (userId) => {
  return isUserAuthorized(getAuthorizations(), userId, null, null, null, ['user', 'research'], true);
};

export const isErpAdmin = (userId) => {
  return isUserAuthorized(getAuthorizations(), userId, null, null, null, ['user', 'erp'], true);
};

export const hasRoleOnClient = (userId, clientId, role) => {
  return isSuperUser(userId) ||
    isUserAuthorized(getAuthorizations(), userId, ResourceTypes.Client, clientId, role);
};

export const hasRoleOnProject = (userId, projectId, role) => {
  return isSuperUser(userId) ||
    isUserAuthorized(getAuthorizations(), userId, ResourceTypes.Project, projectId, role);
};

export const hasRoleOnReport = (userId, reportId, role) => {
  return isSuperUser(userId) ||
    isUserAuthorized(getAuthorizations(), userId, ResourceTypes.Report, reportId, role);
};

export default store;
