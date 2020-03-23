import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './auth/reducers';
import usersReducer from './users/reducers';
import clientsReducer from './clients/reducers';
import projectsReducer from './projects/reducers';
import reportsReducer from './reports/reducers';
import locationReducer from './location/reducers';

export const pushToStack = (stack, data) => {
  data = Array.isArray(data) ? data : [data];

  const resIdToStackIndex = {};

  stack.forEach((stackRes, index) => {
    resIdToStackIndex[stackRes.id] = index;
  });

  data.forEach(res => {
    if (resIdToStackIndex.hasOwnProperty(res.id)) {
      const index = resIdToStackIndex[res.id];
      stack[index] = res;
    } else {
      stack.push(res);
    }
  });

  return stack;
};

export default createStore(combineReducers({
  authReducer,
  usersReducer,
  clientsReducer,
  projectsReducer,
  reportsReducer,
  locationReducer,
}), applyMiddleware(thunk));
