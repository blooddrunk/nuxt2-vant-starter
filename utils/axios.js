import { CancelToken } from 'axios';

// export const takeLatest = axiosCall => {
//   let cancel;

//   return config => {
//     if (cancel) {
//       cancel(`[${config.url}]: Only one request allowed at a time.`);
//     }

//     const request = axiosCall({
//       ...config,
//       cancelToken: new CancelToken(c => {
//         cancel = c;
//       }),
//     });
//     return request;
//   };
// };

export const takeLatest = (axios) => {
  let source;

  const cancellableCall = (config) => {
    if (source) {
      source.cancel(`[${config.url}]: Only one request allowed at a time.`);
    }

    source = CancelToken.source();
    cancellableCall.cancel = source.cancel;

    return axios({
      ...config,
      cancelToken: source.token,
    });
  };

  return cancellableCall;
};

export class RequestManager {
  constructor(options = {}, installRequests = []) {
    this.options = options;
    this.requests = new Map(installRequests);
  }

  add(requestId, cancelFn) {
    this.log(`Adding request '${requestId}'`);

    if (this.requests.has(requestId)) {
      this.cancel(requestId, `Duplicate request '${requestId}', cancelling...`);
    }

    this.requests.set(requestId, cancelFn);
  }

  remove(requestId) {
    this.log(`Removing request '${requestId}'`);
    this.requests.delete(requestId);
  }

  cancel(requestId, reason = '') {
    if (this.requests.has(requestId)) {
      this.requests.get(requestId)(reason);
      this.remove(requestId);
      this.log(`Request '${requestId}' cancelled`);
    }
  }

  cancelAll(reason = '') {
    this.requests.forEach((cancelFn, key) => {
      cancelFn(reason);
      this.remove(key);
      this.log(`Request '${key}' cancelled`);
    });
  }

  log(message) {
    const { debug, logger } = this.options;
    const prefix = '[RequestManager]: ';

    if (debug) {
      logger(`${prefix}${message}`);
    }
  }
}

// patch axios instance
export default (axios, { debug = false, logger = console.log } = {}) => {
  const requestManager = new RequestManager({ debug, logger });

  const getRequestId = ({ cancellable, method, url }) => {
    let requestId;
    if (cancellable === true) {
      // auto-set requestId
      requestId = `${method}_${url}`;
    } else if (typeof cancellable === 'string') {
      requestId = cancellable;
    }

    return requestId;
  };

  axios.interceptors.request.use((config) => {
    const requestId = getRequestId(config);

    if (requestId) {
      const source = CancelToken.source();
      config.cancelToken = source.token;
      requestManager.add(requestId, source.cancel);
    }

    return config;
  });

  axios.interceptors.response.use((response) => {
    const requestId = getRequestId(response.config);
    if (requestId) {
      requestManager.remove(requestId);
    }

    return response;
  });

  axios.cancel = (requestId, reason) => {
    requestManager.cancel(requestId, reason);
  };

  axios.cancelAll = (reason) => {
    requestManager.cancelAll(reason);
  };
};
