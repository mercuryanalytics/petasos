const Routes = {
  Home: '/',
  CreateClient: '/clients/new',
  ManageClient: '/clients/:id',
  ManageClientUser: '/clients/:id/accounts/:userId',
  CreateProject: '/projects/new/:clientId',
  ManageProject: '/projects/:id',
  CreateReport: '/reports/new/:projectId',
  ManageReport: '/reports/:id',
  Account: '/account',
  SuperUser: '/super-user',
  Login: '/login',
  LoginCallback: '/auth/auth0/callback',
  Logout: '/logout',
  LogoutCallback: '/',
};

export default Routes;
