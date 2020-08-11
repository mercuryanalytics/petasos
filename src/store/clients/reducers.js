import { pushToStack, orderStack, UserRolesWriteToRead } from '../index';

const initialState = {
  clients: [],
  domains: [],
  templates: {},
};

export const sortClients = (stack) => orderStack(stack, {
  descending: false,
  valueProperty: 'name',
});

const clientsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_CLIENTS_SUCCESS': {
      const clients = sortClients(pushToStack(state.clients, action.payload));
      return {
        ...state,
        clients: clients,
      };
    }
    case 'GET_CLIENT_SUCCESS': {
      const clients = sortClients(pushToStack(state.clients, action.payload));
      return {
        ...state,
        clients: clients,
      };
    }
    case 'CREATE_CLIENT_SUCCESS': {
      const clients = sortClients(pushToStack(state.clients, action.payload));
      return {
        ...state,
        clients: clients,
      };
    }
    case 'UPDATE_CLIENT_SUCCESS': {
      const clients = sortClients(pushToStack(state.clients, action.payload, { updateOnly: true }));
      return {
        ...state,
        clients: clients,
      };
    }
    case 'DELETE_CLIENT_SUCCESS': {
      const fakeRes = { id: action.clientId };
      const clients = pushToStack(state.clients, fakeRes, { deleteOnly: true });
      return {
        ...state,
        clients: clients,
      };
    }
    case 'GET_TEMPLATES_SUCCESS': {
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.clientId]: action.payload,
        },
      };
    }
    case 'UPDATE_TEMPLATE_SUCCESS': {
      if (!state.templates.hasOwnProperty(action.clientId)) {
        return state;
      }
      const type = action.data.resource_type;
      const id = action.data.resource_id;
      const status = !!action.data.state;
      const alignScopes = (scopes) => {
        scopes = [ ...scopes ];
        let scope = action.data.role;
        if (scope) {
          scope = UserRolesWriteToRead[scope];
          const scopeIndex = scopes.indexOf(scope);
          if (scopeIndex > -1) {
            scopes.splice(scopeIndex, 1);
          }
          if (action.data.role_state) {
            scopes.push(scope);
          }
        }
        return scopes;
      };
      let clientTemplates = state.templates[action.clientId];
      if (type === 'client') {
        clientTemplates = {
          ...clientTemplates,
          authorized: status,
          roles: alignScopes(clientTemplates.roles),
        };
      } else if (type === 'project') {
        let projects = clientTemplates.projects;
        projects.forEach((project, i) => {
          if (project.id === id) {
            projects[i] = { ...project, authorized: status, roles: alignScopes(project.roles) };
          }
        });
        clientTemplates = {
          ...clientTemplates,
          projects: [ ...projects ],
        };
      } else if (type === 'report') {
        let projects = clientTemplates.projects;
        projects.forEach((project, i) => {
          project.reports.forEach((report, j) => {
            if (report.id === id) {
              let reports = project.reports;
              reports[j] = { ...report, authorized: status, roles: alignScopes(report.roles) };
              projects[i] = { ...project, reports: [ ...reports ] };
            }
          });
        });
        clientTemplates = {
          ...clientTemplates,
          projects: [ ...projects ],
        };
      }
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.clientId]: { ...clientTemplates },
        },
      };
    }
    case 'GET_DOMAINS_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload);
      return {
        ...state,
        domains: domains,
      };
    }
    case 'GET_DOMAIN_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload);
      return {
        ...state,
        domains: domains,
      };
    }
    case 'CREATE_DOMAIN_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload);
      return {
        ...state,
        domains: domains,
      };
    }
    case 'UPDATE_DOMAIN_SUCCESS': {
      const domains = pushToStack(state.domains, action.payload, { updateOnly: true });
      return {
        ...state,
        domains: domains,
      };
    }
    case 'DELETE_DOMAIN_SUCCESS': {
      const fakeRes = { id: action.domainId };
      const domains = pushToStack(state.domains, fakeRes, { deleteOnly: true });
      return {
        ...state,
        domains: domains,
      };
    }
    default: {
      return state;
    }
  }
};

export default clientsReducer;
