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
  ClientAccess: 'client_access',
  ProjectAccess: 'project_access'
};

export const UserRolesWriteToRead = {
  [UserRoles.ClientManager]: 'client_editor',
  [UserRoles.ClientAdmin]: 'client_admin',
  [UserRoles.ProjectManager]: 'project_editor',
  [UserRoles.ProjectAdmin]: 'project_admin',
  [UserRoles.ReportManager]: 'report_editor',
  [UserRoles.ReportAdmin]: 'report_admin',
  [UserRoles.Viewer]: 'viewer',
  [UserRoles.ClientAccess]: 'client_access',
  [UserRoles.ProjectAccess]: 'project_access'
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

export const orderStack = (stack, options) => {
  options = Object.assign({}, {
    valueProperty: null,
    descending: false,
    valueFormatter: null,
  }, options);
  return [
    ...stack.sort((a, b) => {
      let va, vb, foundA, foundB, properties = options.valueProperty;
      if (!Array.isArray(properties)) {
        properties = [properties];
      }
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        if (!foundA && a[property]) {
          va = a[property];
          foundA = true;
        }
        if (!foundB && b[property]) {
          vb = b[property];
          foundB = true;
        }
      }
      if (options.valueFormatter) {
        va = options.valueFormatter(va);
        vb = options.valueFormatter(vb);
      }
      if (typeof va === 'string' || va instanceof String) {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      if (va > vb) {
        return options.descending ? -1 : 1;
      }
      if (vb > va) {
        return options.descending ? 1 : -1;
      }
      return 0;
    })
  ];
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

export const isUserAuthorized = (authorizations, userId, resType, resId, role, scopeId, isGlobal, specific) => {
  const canInheritAccess = !specific && !isGlobal && resType;
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
          if (role) {
            const roles = Array.isArray(a[1]) ? a[1] : [a[1]];
            if (roles.indexOf(UserRolesWriteToRead[role]) > -1) {
              return true;
            }
            if (canInheritAccess && role !== UserRoles.ClientAccess && role !== UserRoles.ProjectAccess) {
              const accessRole = resType === ResourceTypes.Client ?
                UserRoles.ClientAccess : (resType === ResourceTypes.Project ? UserRoles.ProjectAccess : null);
              if (roles.indexOf(UserRolesWriteToRead[accessRole]) > -1) {
                return true;
              }
            }
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
  if (canInheritAccess) {
    const state = store.getState();
    if (state) {
      if (resType === ResourceTypes.Report) {
        const report = state.reportsReducer.reports.filter(r => r.id === resId)[0];
        if (report) {
          return (
            isUserAuthorized(authorizations, userId, ResourceTypes.Project,
              report.project_id, UserRoles.ProjectAccess, scopeId, isGlobal) ||
            isUserAuthorized(authorizations, userId, ResourceTypes.Client,
              report.project.domain_id, UserRoles.ClientAccess, scopeId, isGlobal)
          );
        }
      }
      if (resType === ResourceTypes.Project) {
        const project = state.projectsReducer.projects.filter(p => p.id === resId)[0];
        if (project) {
          return isUserAuthorized(authorizations, userId, ResourceTypes.Client,
            project.domain_id, UserRoles.ClientAccess, scopeId, isGlobal);
        }
      }
    }
  }
  return false;
};

export const isUserSpecificallyAuthorized = (authorizations, userId, resType, resId, role, scopeId, isGlobal) => {
  return isUserAuthorized(authorizations, userId, resType, resId, role, scopeId, isGlobal, true);
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
