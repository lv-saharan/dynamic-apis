export const createHeaders = (headers = {}) => {
  headers = typeof headers == "function" ? headers() : headers;
  for (let p in headers) {
    const value = headers[p];
    if (typeof value === "function") {
      headers[p] = value();
    }
  }
  return new Headers({
    "Content-Type": "application/json",
    ...headers,
  });
};
const buildParams = (searchParams, parentKey = "", params = {}) => {
  for (let key in params) {
    const value = params[key];
    if (value instanceof Array) {
      for (let v of value) {
        searchParams.append(`${parentKey}${key}`, v);
      }
      continue;
    } else if (value === null || typeof value !== "object") {
      searchParams.set(`${parentKey}${key}`, value);
      continue;
    }
    buildParams(searchParams, `${parentKey}${key}.`, value);
  }
};
export const buildURL = (url, params = {}) => {
  const reqURL = new URL(url);
  buildParams(reqURL.searchParams, "", params);
  return reqURL.href;
};
const buildRequest = (method, url, data, headers, params) => {
  if (method == "GET" || method == "DELETE") {
    url = buildURL(url, data);
    data = null;
  } else {
    url = buildURL(url, params);
  }
  headers = createHeaders(headers);
  if (data instanceof FormData) {
    headers.delete("Content-Type");
  } else {
    data = data != null ? JSON.stringify(data) : null;
  }
  return new Request(url, {
    method,
    headers,
    body: data,
  });
};

export const processRequest = async (method, url, data, headers, params) => {
  let req = buildRequest(method, url, data, headers ?? {}, params);
  return fetch(req).then((rsp) => {
    if (!rsp.ok) {
      let errorEvent = new CustomEvent("fetcherror", {
        detail: {
          method: req.method,
          url: req.url,
          body: data,
          status: rsp.status,
          statusText: rsp.statusText,
        },
      });
      window.dispatchEvent(errorEvent);
      return new Error({
        status: rsp.status,
        statusText: rsp.statusText,
      });
    }
    try {
      return rsp.json();
    } catch (exc) {
      console.error(`fetch ${req.url} error，返回值不是JSON`, exc);
    }
  });
};
export const request = {
  async get(url, params, headers) {
    return processRequest("GET", url, params, headers);
  },
  async post(url, data, headers, params) {
    return processRequest("POST", url, data, headers, params);
  },
  async put(url, data, headers, params) {
    return processRequest("PUT", url, data, headers, params);
  },
  async patch(url, data, headers) {
    return processRequest("PATCH", url, data, headers);
  },
  async delete(url, data, headers, params) {
    return processRequest("DELETE", url, data, headers, params);
  },
};

export default request;
