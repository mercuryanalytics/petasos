import store from '../store';

let called = {};

function apiCall (method, url, options) {
  const state = store.getState();
  const authKey = state.authReducer.authKey;

  if (!authKey) {
    return new Promise((resolve) => {
      return resolve('');
    });
  }

  options = options || {};

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
    .then(response => {
      if (method.toUpperCase() === 'GET') {
        if (!response.ok) {
          return Promise.reject(`Fetch error: ${response.status} ${response.statusText}`);
        }
        called[url] = true;
      }
      return response.text();
    })
    .then(
      response => {
        if (response.trim().length) {
          try {
            let result = JSON.parse(response);
            if (result.hasOwnProperty('errors')) {
              return Promise.reject(result);
            }
            return result.hasOwnProperty('data') ? result.data : '';
          } catch (e) {
            return Promise.reject(e);
          }
        }
        return '';
      },
      reason => {
        return Promise.reject(reason);
      }
    );
};

apiCall.isCalled = (urls) => {
  urls = Array.isArray(urls) ? urls : [urls];
  for (let i = 0; i < urls.length; i++) {
    if (called.hasOwnProperty(urls[i])) {
      return true;
    }
  }
  return false;
};

apiCall.forget = (urls) => {
  urls = Array.isArray(urls) ? urls : [urls];
  for (let i = 0; i < urls.length; i++) {
    if (called.hasOwnProperty(urls[i])) {
      delete called[urls[i]];
    }
  }
};

apiCall.forgetAll = () => {
  called = {};
};

export default apiCall;
