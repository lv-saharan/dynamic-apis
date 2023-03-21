import request from "./request.js";

class Controller {
  #tableName = "";
  #controllerURL = "";
  #headers = {};
  #beforeSends = [];
  #afterReceives = [];
  constructor(name, baseUrl, headers, beforeSends, afterReceives) {
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
  async post(data) {
    const config = { url: this.controllerURL, data, headers: this.headers };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.post(config.url, config.data, config.headers);
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
  async put(id, data) {
    if (data == undefined) {
      data = id;
      id = null;
    }
    const config = {
      url: id == null ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.put(config.url, config.data, config.headers);
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
  async patch(id, data) {
    if (data == undefined) {
      data = id;
      id = null;
    }
    const config = {
      url: id == null ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.patch(config.url, config.data, config.headers);
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

  add = this.post;
  update = this.put;
  modify = this.patch;
  del = this.delete;
}
const handler = {
  get(target, property, receiver) {
    if (property in target) {
      return target[property];
    }
    let match =
      /^(?<action>get|add|post|update|put|patch|modify|del|delete)(?<name>\w+)/i.exec(
        property
      );
    if (match) {
      let [first, ...rest] = match.groups.name;
      let name = [first.toLowerCase(), ...rest].join("");
      let controller = new Controller(
        name,
        target.controllerURL + "/",
        target.headers,
        target.beforeSends,
        target.afterReceives
      );
      return controller[match.groups.action].bind(controller);
    }
    return createController(
      property,
      target.controllerURL + "/",
      target.headers,
      target.beforeSends,
      target.afterReceives
    );
  },
};
export const createController = (
  name,
  baseUrl,
  headers,
  beforeSends,
  afterReceives
) => {
  return new Proxy(
    new Controller(name, baseUrl, headers, beforeSends, afterReceives),
    handler
  );
};

export default {
  create: createController,
};
