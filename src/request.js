export const createHeaders = (headers) => {
  return new Headers({
    "Content-Type": "application/json",
    ...(typeof headers == "function" ? headers() : headers)
  });
}
const buildParams = (searchParams, parentKey = "", params = {}) => {
  for (let key in params) {
    const value = params[key]
    if (value === null || typeof value !== "object") {
      searchParams.set(`${parentKey}${key}`, value)
      continue;
    }
    buildParams(searchParams, `${parentKey}${key}.`, value)
  }
}
export const buildURL = (url, params = {}) => {
  const reqURL = new URL(url)
  buildParams(reqURL.searchParams, "", params)
  return reqURL.href;
}
const buildRequest = (method, url, data, headers) => {
  if (method == "GET" || method == "DELETE") {
    url = buildURL(url, data);
    data = null;
  }

  return new Request(url, {
    method,
    headers: createHeaders(headers),
    body: data != null ? JSON.stringify(data) : null,
  });
}

export const processRequest = async (method, url, data, headers) => {
  let req = buildRequest(method, url, data, headers ?? {});
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
        statusText: rsp.statusText
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
  async post(url, data, headers) {
    return processRequest("POST", url, data, headers);
  },
  async put(url, data, headers) {
    return processRequest("PUT", url, data, headers);
  },
  async patch(url, data, headers) {
    return processRequest("PATCH", url, data, headers);
  },
  async delete(url, data, headers) {
    return processRequest("DELETE", url, data, headers);
  },
};

export default request;
