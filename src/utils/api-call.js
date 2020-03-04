import store from '../store';

const apiCall = (method, url, options) => {
  const authKey = store.getState().authReducer.authKey;
  if (!authKey) {
    return;
  }
  options = options || {};
  let finalOptions = {
    method: method,
    headers: new Headers({
      'Authorization': `Bearer ${authKey}`,
      'Content-Type': 'application/json',
    }),
  };
  if (options.body) {
    finalOptions.body = options.body;
  }
  return fetch(url, finalOptions)
    .then(res => res.json())
    .then(res => res.data);
};

export default apiCall;
