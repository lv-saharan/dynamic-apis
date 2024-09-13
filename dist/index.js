// src/request.ts
function mapHeaders(headers = {}) {
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
    ...headers
  });
}
function buildParams(searchParams, parentKey = "", params = {}) {
  for (let key in params) {
    const value = params[key];
    if (value instanceof Array) {
      for (let v of value) {
        searchParams.append(`${parentKey}${key}`, v);
      }
    } else if (value === null) {
      searchParams.set(`${parentKey}${key}`, "");
    } else if (typeof value === "string" || typeof value === "number") {
      searchParams.set(`${parentKey}${key}`, value);
    } else {
      buildParams(searchParams, `${parentKey}${key}.`, value);
    }
  }
}
var buildURL = (url, params = {}) => {
  const reqURL = new URL(url);
  buildParams(reqURL.searchParams, "", params);
  return reqURL.href;
};
function buildRequest(method, url, headers, params, data) {
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
    body: data
  });
}
async function processRequest(method, url, params, headers, data) {
  let req = buildRequest(method, url, headers, params, data);
  return fetch(req).then((rsp) => {
    if (!rsp.ok) {
      let errorEvent = new CustomEvent("fetcherror", {
        detail: {
          method: req.method,
          url: req.url,
          body: data,
          status: rsp.status,
          statusText: rsp.statusText
        }
      });
      window.dispatchEvent(errorEvent);
      throw new Error(`fetch ${req.url} error\uFF0Cstatus=${rsp.status}`);
    }
    try {
      return rsp.json();
    } catch (exc) {
      console.error(`fetch ${req.url} error\uFF0C\u8FD4\u56DE\u503C\u4E0D\u662FJSON`, exc);
    }
  });
}
var request = {
  async get(url, params, headers) {
    return processRequest("GET", url, params, headers);
  },
  async post(url, params, headers, data) {
    return processRequest("POST", url, params, headers, data);
  },
  async put(url, params, headers, data) {
    return processRequest("PUT", url, params, headers, data);
  },
  async patch(url, params, headers, data) {
    return processRequest("PATCH", url, params, headers, data);
  },
  async delete(url, params, headers) {
    return processRequest("DELETE", url, params, headers);
  }
};
var request_default = request;

// src/controller.ts
var ParseActions = [
  "get",
  "post",
  "add",
  "update",
  "put",
  "patch",
  "modify",
  "delete",
  "del"
];
var ParseActionsRegExp = new RegExp(
  `^(?<action>${ParseActions.join("|")})(?<name>\\w+)`,
  "i"
);
var Controller = class {
  #tableName = "";
  #controllerURL = "";
  #headers = {};
  #beforeSends = [];
  #afterReceives = [];
  #actionsMap = {
    get: true,
    post: "add",
    put: "update",
    patch: "modify",
    delete: "del"
  };
  #parseActionsRegExp = ParseActionsRegExp;
  constructor(name, baseUrl, headers = {}, beforeSends = [], afterReceives = [], actionsMap, parseActions) {
    baseUrl = baseUrl ?? location.href;
    name = name + "";
    this.#headers = headers ?? {};
    this.#controllerURL = new URL(name, baseUrl).href;
    if (name.startsWith("/")) {
      name = name.substring(1);
    }
    this.#tableName = name;
    if (beforeSends) this.#beforeSends = beforeSends;
    if (afterReceives) this.#afterReceives = afterReceives;
    this.#actionsMap = actionsMap ?? this.#actionsMap;
    if (parseActions instanceof Array) {
      this.#parseActionsRegExp = new RegExp(
        `^(?<action>${parseActions.join("|")})(?<name>\\w+)`,
        "i"
      );
    }
    for (let key in this.#actionsMap) {
      const val = this.#actionsMap[key];
      if (typeof key !== "string") {
        continue;
      }
      if (typeof val === "string" && this[val] === void 0) {
        this[val] = this[key];
      }
      if (val instanceof Array && val.length) {
        for (let action of val) {
          if (typeof action === "string" && this[action] === void 0) {
            this[action] = this[key];
          }
        }
      }
    }
  }
  get headers() {
    return this.#headers;
  }
  get controllerURL() {
    return this.#controllerURL;
  }
  get beforeSends() {
    return this.#beforeSends;
  }
  get afterReceives() {
    return this.#afterReceives;
  }
  get actionsMap() {
    return this.#actionsMap;
  }
  get parseActionsRegExp() {
    return this.#parseActionsRegExp;
  }
  id(id) {
    return createController(
      id,
      this.controllerURL + "/",
      this.headers,
      this.beforeSends,
      this.afterReceives
    );
  }
  path(path) {
    return createController(
      path,
      this.controllerURL + "/",
      this.headers,
      this.beforeSends,
      this.afterReceives
    );
  }
  beforeSend(handler2) {
    if (!handler2) throw new Error("need a handler");
    this.beforeSends.push(handler2);
  }
  afterReceive(handler2) {
    if (!handler2) throw new Error("need a handler");
    this.afterReceives.push(handler2);
  }
  /**
   * id可以是一个id，或者为空，或者一个查询
   * @param {*} id
   */
  async get(id) {
    let url = `${this.controllerURL}`;
    let params = void 0;
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(",")}`;
    } else if (typeof id == "object") {
      params = id;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }
    const config = {
      url,
      method: "GET",
      params,
      headers: this.headers
    };
    this.beforeSends.forEach((handler2) => {
      handler2(config);
    });
    const result = await request_default.get(config.url, config.params, config.headers);
    this.afterReceives.forEach((handler2) => {
      handler2(result);
    });
    return result;
  }
  /**
   * 新增
   * @param {*} data
   */
  async post(data, params) {
    const config = {
      url: this.controllerURL,
      data,
      headers: this.headers,
      params,
      method: "POST"
    };
    this.beforeSends.forEach((handler2) => {
      handler2(config);
    });
    const result = await request_default.post(
      config.url,
      config.params,
      config.headers,
      config.data
    );
    this.afterReceives.forEach((handler2) => {
      handler2(result);
    });
    return result;
  }
  /**
   * update
   * @param {*} id
   * @param {*} data
   */
  async put(id, data, params) {
    if (data == void 0 && typeof id === "object") {
      data = id;
      id = void 0;
    }
    const config = {
      url: id == void 0 ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
      params,
      method: "PUT"
    };
    this.beforeSends.forEach((handler2) => {
      handler2(config);
    });
    const result = await request_default.put(
      config.url,
      config.params,
      config.headers,
      config.data
    );
    this.afterReceives.forEach((handler2) => {
      handler2(result);
    });
    return result;
  }
  /**
   * patch
   * @param {*} id
   * @param {*} data
   */
  async patch(id, data, params) {
    if (data == void 0 && typeof id === "object") {
      data = id;
      id = void 0;
    }
    const config = {
      url: id == void 0 ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
      params,
      method: "PATCH"
    };
    this.beforeSends.forEach((handler2) => {
      handler2(config);
    });
    const result = await request_default.patch(
      config.url,
      config.params,
      config.headers,
      config.data
    );
    this.afterReceives.forEach((handler2) => {
      handler2(result);
    });
    return result;
  }
  /**
   * id可以是一个id，或者一个数组，或者一个查询
   * @param {*} id
   */
  async delete(id) {
    let url = `${this.controllerURL}`;
    let params = void 0;
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(",")}`;
    } else if (typeof id == "object") {
      params = id;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }
    const config = {
      method: "DELETE",
      url,
      params,
      headers: this.headers
    };
    this.beforeSends.forEach((handler2) => {
      handler2(config);
    });
    const result = await request_default.delete(
      config.url,
      config.params,
      config.headers
    );
    this.afterReceives.forEach((handler2) => {
      handler2(result);
    });
    return result;
  }
};
var handler = {
  get(target, property, receiver) {
    const controller = target.$controller;
    if (property in controller) {
      return controller[property];
    }
    let match = controller.parseActionsRegExp.exec(property);
    let $action = void 0;
    if (match && match.groups) {
      let [first, ...rest] = match.groups.name;
      let name = [first.toLowerCase(), ...rest].join("");
      property = name;
      $action = match.groups.action;
    }
    return createController(
      property,
      controller.controllerURL + "/",
      controller.headers,
      controller.beforeSends,
      controller.afterReceives,
      controller.actionsMap,
      controller.parseActions,
      $action
    );
  },
  apply(target, thisArg, argumentsList) {
    const controller = target.$controller;
    const action = target.$action;
    if (action) {
      return controller[action].apply(controller, argumentsList);
    }
    if (argumentsList.length === 0) return new Proxy(target, handler);
    const [param] = argumentsList;
    return createController(
      param,
      controller.controllerURL + "/",
      controller.headers,
      controller.beforeSends,
      controller.afterReceives,
      controller.actionsMap,
      controller.parseActions
    );
  }
};
function createController(name, baseUrl, headers = {}, beforeSends = [], afterReceives = [], actionsMap, parseActions, $action) {
  const func = () => {
  };
  func.$action = $action;
  func.$controller = new Controller(
    name,
    baseUrl,
    headers,
    beforeSends,
    afterReceives,
    actionsMap,
    parseActions
  );
  return new Proxy(func, handler);
}

// src/index.ts
var src_default = {
  request: request_default,
  createController,
  Controller
};
export {
  Controller,
  createController,
  src_default as default,
  request_default as request
};
//# sourceMappingURL=index.js.map
