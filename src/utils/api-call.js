import store from '../store';

let cached = {};

const apiCall = (method, url, options) => {
  const authKey = store.getState().authReducer.authKey;
  if (!authKey) {
    return;
  }
  if (method.toUpperCase() === 'GET') {
    const urlNoQs = url.split('?')[0];
    let block = cached.hasOwnProperty(url);
    if (!block) {
      if (url.indexOf('/researchers') === -1 && url.indexOf('/authorized') === -1) {
        if (url.indexOf('?') > -1) {
          if (!!cached[urlNoQs]) {
            block = true;
          }
        } else {
          for (let cachedUrl in cached) {
            if (url.indexOf(cachedUrl) === 0) {
              block = true;
              break;
            }
          }
        }
        cached[url] = true;
      }
    }
    if (block) {
      return (new Promise((resolve, reject) => {
        resolve([]);
      }));
    }
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
    .then(res => res.text())
    .then(res => {
      try {
        let result = JSON.parse(res).data;
        if (url.indexOf('/authorized') > -1 && Array.isArray(result)) {
          cached[url] = true;
        }
        return result;
      } catch (e) {
        return '';
      }
    });
};

export default apiCall;
