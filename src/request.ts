import {
  ApiHeaders,
  BeforeSendConfig,
  BeforeSendHandler,
  ApiProxy,
  ApiParams,
  ApiMethod,
} from "./definitions";
function mapHeaders(
  headers: ApiHeaders | (() => ApiHeaders) = {}
): Headers {
  if (typeof headers === "function") {
    return mapHeaders(headers());
  }

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
}
function buildParams(
  searchParams: URLSearchParams,
  parentKey = "",
  params: ApiParams = {}
) {
  for (let key in params) {
    const value = params[key];
    if (value instanceof Array) {
      for (let v of value) {
        searchParams.append(`${parentKey}${key}`, v);
      }
    } else if (value === null) {
      searchParams.set(`${parentKey}${key}`, "");
    } else if (typeof value === "string" || typeof value === "number") {
      searchParams.set(`${parentKey}${key}`, value as string);
    } else {
      buildParams(searchParams, `${parentKey}${key}.`, value);
    }
  }
}
export const buildURL = (url: string, params: ApiParams = {}) => {
  const reqURL = new URL(url);
  buildParams(reqURL.searchParams, "", params);
  return reqURL.href;
};
function buildRequest(
  method: ApiMethod,
  url: string,
  headers?: ApiHeaders,
  params?: ApiParams,
  data?: any
) {
  url = buildURL(url, params);
  const requestHeader = mapHeaders(headers);

  if (data instanceof FormData) {
    requestHeader.delete("Content-Type");
  } else {
    data = data != null ? JSON.stringify(data) : null;
  }
  return new Request(url, {
    method,
    headers: requestHeader,
    body: data,
  });
}

async function processRequest(
  method: ApiMethod,
  url: string,
  params?: ApiParams,
  headers?: ApiHeaders,
  data?: any
) {
  let req = buildRequest(method, url, headers, params, data);
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
      throw new Error(`fetch ${req.url} error，status=${rsp.status}`);
    }
    try {
      return rsp.json();
    } catch (exc) {
      console.error(`fetch ${req.url} error，返回值不是JSON`, exc);
    }
  });
}
export const request = {
  async get(url: string, params?: ApiParams, headers?: ApiHeaders) {
    return processRequest("GET", url, params, headers);
  },
  async post(
    url: string,
    params?: ApiParams,
    headers?: ApiHeaders,
    data?: any
  ) {
    return processRequest("POST", url, params, headers, data);
  },
  async put(
    url: string,
    params?: ApiParams,
    headers?: ApiHeaders,
    data?: any
  ) {
    return processRequest("PUT", url, params, headers, data);
  },
  async patch(
    url: string,
    params?: ApiParams,
    headers?: ApiHeaders,
    data?: any
  ) {
    return processRequest("PATCH", url, params, headers, data);
  },
  async delete(url: string, params?: ApiParams, headers?: ApiHeaders) {
    return processRequest("DELETE", url, params, headers);
  },
};

export default request;
