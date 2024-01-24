import request from "./request.js";
const ParseActions = [
  "get",
  "post",
  "add",
  "update",
  "put",
  "patch",
  "modify",
  "delete",
  "del",
];
const ParseActionsRegExp = new RegExp(
  `^(?<action>${ParseActions.join("|")})(?<name>\\w+)`,
  "i"
);

export class Controller {
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
    delete: "del",
  };
  #parseActionsRegExp = ParseActionsRegExp;

  constructor(
    name,
    baseUrl,
    headers,
    beforeSends,
    afterReceives,
    actionsMap,
    parseActions
  ) {
    baseUrl = baseUrl ?? location.href;
    name = name + "";
    this.#headers = headers ?? {};
    this.#controllerURL = new URL(name, baseUrl).href;
    if (name.startsWith("/")) {
      name = name.substr(1);
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
      if (typeof val === "string" && this[val] === undefined) {
        this[val] = this[key];
      }
      if (val instanceof Array && val.length) {
        for (let action of val) {
          if (typeof action === "string" && this[action] === undefined) {
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
  beforeSend(handler) {
    if (!handler) throw new Error("need a handler");
    this.beforeSends.push(handler);
  }
  afterReceive(handler) {
    if (!handler) throw new Error("need a handler");
    this.afterReceives.push(handler);
  }
  /**
   * id可以是一个id，或者为空，或者一个查询
   * @param {*} id
   */
  async get(id) {
    let url = `${this.controllerURL}`;
    let data = null;
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(",")}`;
    } else if (typeof id == "object") {
      data = id;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }
    const config = { url, data, headers: this.headers };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.get(config.url, config.data, config.headers);
    this.afterReceives.forEach((handler) => {
      handler(result);
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
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.post(
      config.url,
      config.data,
      config.headers,
      config.params
    );
    this.afterReceives.forEach((handler) => {
      handler(result);
    });
    return result;
  }

  /**
   * update
   * @param {*} id
   * @param {*} data
   */
  async put(id, data, params) {
    if (data == undefined && typeof id === "object") {
      data = id;
      id = null;
    }
    const config = {
      url: id == null ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
      params,
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.put(
      config.url,
      config.data,
      config.headers,
      config.params
    );
    this.afterReceives.forEach((handler) => {
      handler(result);
    });
    return result;
  }

  /**
   * patch
   * @param {*} id
   * @param {*} data
   */
  async patch(id, data, params) {
    if (data == undefined && typeof id === "object") {
      data = id;
      id = null;
    }
    const config = {
      url: id == null ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
      params,
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.patch(
      config.url,
      config.data,
      config.headers,
      config.params
    );
    this.afterReceives.forEach((handler) => {
      handler(result);
    });
    return result;
  }

  /**
   * id可以是一个id，或者一个数组，或者一个查询
   * @param {*} id
   */
  async delete(id) {
    let url = `${this.controllerURL}`;
    let data = null;
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(",")}`;
    } else if (typeof id == "object") {
      data = id;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }

    const config = { url, data, headers: this.headers };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.delete(
      config.url,
      config.data,
      config.headers
    );
    this.afterReceives.forEach((handler) => {
      handler(result);
    });
    return result;
  }
}
const handler = {
  get(target, property, receiver) {
    const controller = target.$controller;
    if (property in controller) {
      return controller[property];
    }
    let match = controller.parseActionsRegExp.exec(property);

    let $action = false;
    if (match) {
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
  },
};
/**
 * 
 * @param {*} name 
 * @param {*} baseUrl 
 * @param {*} headers 
 * @param  {...any} options 
 * [

 * beforeSends
 * afterReceives
 *  * actionsMap:{
 * 
 *    get:true,
      post:"add",
      put:"update",
      patch:"modify",
      delete:["del","remove",false] //false mean dont parse delSomething to something.del()
 * }
    parseAction:["get","add","update"...]
 * ]
 * @returns 
 */
export const createController = (
  name,
  baseUrl,
  headers,
  beforeSends,
  afterReceives,
  actionsMap,
  parseActions,
  $action
) => {
  const func = () => {};
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
};

export default {
  create: createController,
};
