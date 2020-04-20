import store from '../store';

let cached = {};

const apiCall = (method, url, options) => {
  const state = store.getState();
  const authKey = state.authReducer.authKey;
  let cache = false;

  if (!authKey) {
    return;
  }

  options = options || {};

  if (method.toUpperCase() === 'GET') {
    let block = cached.hasOwnProperty(url);
    if (!block) {
      // @TODO Enable caching
      // cache = true;
    }
    if (block) {
      return (new Promise((resolve) => {
        const _result = JSON.parse(cached[url]);
        return resolve(_result.hasOwnProperty('data') ? _result.data : _result);
      }));
    }
  }

  let fetchOptions = {
    method: method,
    headers: new Headers({
      'Authorization': `Bearer ${authKey}`,
      'Content-Type': 'application/json',
    }),
  };

  if (options.body) {
    fetchOptions.body = options.body;
  }

  return fetch(url, fetchOptions)
    .then(response => response.text())
    .then(response => {
      if (response.trim().length) {
        try {
          let result = JSON.parse(response);
          if (result.hasOwnProperty('errors')) {
            return Promise.reject(result);
          }
          if (cache) {
            cached[url] = JSON.stringify(result);
          }
          return result.hasOwnProperty('data') ? result.data : '';
        } catch (e) {
          return Promise.reject(e);
        }
      }
      return '';
    }, (reason) => {
      return Promise.reject(reason);
    });
};

export default apiCall;
