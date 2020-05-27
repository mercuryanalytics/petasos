import store from '../store';

let ongoing = {};
let called = {};

function apiCall (method, url, options) {
  const state = store.getState();
  const authKey = state.authReducer.authKey;

  options = options || {};
  // @TODO: Check if this is needed - the passowrd_reset routes are non-authorized calls -
  //  thus when clicking the Reset Password button the request is not sent
  //
  // if (!authKey && !options.noAuth) {
  //   return new Promise((resolve) => {
  //     return resolve('');
  //   });
  // }

  let fetchOptions = {
    method: method,
    headers: new Headers({
      ...(authKey ? {
        'Authorization': `Bearer ${authKey}`,
      } : {}),
      'Content-Type': 'application/json',
    }),
  };

  if (options.body) {
    fetchOptions.body = options.body;
  }

  if (!!ongoing[url]) {
    return ongoing[url];
  }

  let handler = fetch(url, fetchOptions)
    .then(
      (response) => {
        if (method.toUpperCase() === 'GET') {
          delete ongoing[url];
          if (!response.ok) {
            return Promise.reject({
              xhrHttpCode: response.status,
              message: `Fetch error: ${response.status} ${response.statusText}`,
            });
          }
          called[url] = true;
        }
        return response.text();
      },
      (reason) => {
        return Promise.reject(reason);
      },
    ).then(
      (response) => {
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
    );

  if (method.toUpperCase() === 'GET') {
    ongoing[url] = handler;
  }

  return handler;
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

apiCall.forget = (criteria) => {
  if (criteria instanceof RegExp) {
    const calledUrls = Object.keys(called);
    for (let i = 0; i < calledUrls.length; i++) {
      if (calledUrls[i].match(criteria)) {
        delete called[calledUrls[i]];
      }
    }
  } else {
    const urls = Array.isArray(criteria) ? criteria : [criteria];
    for (let i = 0; i < urls.length; i++) {
      if (called.hasOwnProperty(urls[i])) {
        delete called[urls[i]];
      }
    }
  }
};

apiCall.forgetAll = () => {
  called = {};
};

export default apiCall;
