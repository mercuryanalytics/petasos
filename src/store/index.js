import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer as form  } from 'redux-form';
import authReducer from './auth/reducers'
import clientsReducer from './clients/reducers';
import projectsReducer from './projects/reducers';
import reportsReducer from './reports/reducers';
import locationReducer from './location/reducers';

export default createStore(combineReducers({
  form,
  authReducer,
  clientsReducer,
  projectsReducer,
  reportsReducer,
  locationReducer,
}), applyMiddleware(thunk));
