import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './auth/reducers';
import usersReducer from './users/reducers';
import clientsReducer from './clients/reducers';
import projectsReducer from './projects/reducers';
import reportsReducer from './reports/reducers';
import locationReducer from './location/reducers';

export const pushToStack = (stack, data, options) => {
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

export default createStore(combineReducers({
  authReducer,
  usersReducer,
  clientsReducer,
  projectsReducer,
  reportsReducer,
  locationReducer,
}), applyMiddleware(thunk));
