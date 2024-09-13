import {
  ApiHeaders,
  BeforeSendConfig,
  BeforeSendHandler,
  ApiProxy,
  ApiParams,
  ApiController,
} from "./definitions";
import request from "./request";
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

export class Controller implements ApiController {
  [key: string]: any;
  #tableName = "";
  #controllerURL = "";
  #headers: ApiHeaders = {};
  #beforeSends: Array<BeforeSendHandler> = [];

  #afterReceives: Array<(result: any) => any> = [];
  #actionsMap: Record<string, boolean | string | string[]> = {
    get: true,
    post: "add",
    put: "update",
    patch: "modify",
    delete: "del",
  };
  #parseActionsRegExp = ParseActionsRegExp;

  constructor(
    name: string,
    baseUrl: string,
    headers: ApiHeaders = {},
    beforeSends: Array<BeforeSendHandler> = [],
    afterReceives: Array<(result: any) => any> = [],
    actionsMap?: Record<string, string | boolean | string[]>,
    parseActions?: Array<string>
  ) {
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
  id(id: string | number) {
    return createController(
      id as string,
      this.controllerURL + "/",
      this.headers,
      this.beforeSends,
      this.afterReceives
    );
  }
  path(path: string | number) {
    return createController(
      path as string,
      this.controllerURL + "/",
      this.headers,
      this.beforeSends,
      this.afterReceives
    );
  }
  beforeSend(handler: BeforeSendHandler) {
    if (!handler) throw new Error("need a handler");
    this.beforeSends.push(handler);
  }
  afterReceive(handler: (result: any) => any) {
    if (!handler) throw new Error("need a handler");
    this.afterReceives.push(handler);
  }
  /**
   * id可以是一个id，或者为空，或者一个查询
   * @param {*} id
   */
  async get(id?: string | number | ApiParams | Array<string | number>) {
    let url = `${this.controllerURL}`;
    let params: ApiParams | undefined = undefined;
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(",")}`;
    } else if (typeof id == "object") {
      params = id;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }
    const config: BeforeSendConfig = {
      url,
      method: "GET",
      params,
      headers: this.headers,
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.get(config.url, config.params, config.headers);
    this.afterReceives.forEach((handler) => {
      handler(result);
    });
    return result;
  }
  /**
   * 新增
   * @param {*} data
   */
  async post(data?: any, params?: ApiParams) {
    const config: BeforeSendConfig = {
      url: this.controllerURL,
      data,
      headers: this.headers,
      params,
      method: "POST",
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.post(
      config.url,
      config.params,
      config.headers,
      config.data
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
  async put(
    id: string | number | object | undefined,
    data?: any,
    params?: ApiParams
  ) {
    if (data == undefined && typeof id === "object") {
      data = id;
      id = undefined;
    }
    const config: BeforeSendConfig = {
      url: id == undefined ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
      params,
      method: "PUT",
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.put(
      config.url,
      config.params,
      config.headers,
      config.data
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
  async patch(
    id: string | number | object | undefined,
    data?: any,
    params?: ApiParams
  ) {
    if (data == undefined && typeof id === "object") {
      data = id;
      id = undefined;
    }
    const config: BeforeSendConfig = {
      url: id == undefined ? this.controllerURL : `${this.controllerURL}/${id}`,
      data,
      headers: this.headers,
      params,
      method: "PATCH",
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.patch(
      config.url,
      config.params,
      config.headers,
      config.data
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
  async delete(
    id: string | number | undefined | Array<string | number> | ApiParams
  ) {
    let url = `${this.controllerURL}`;
    let params: ApiParams | undefined = undefined;
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(",")}`;
    } else if (typeof id == "object") {
      params = id;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }

    const config: BeforeSendConfig = {
      method: "DELETE",
      url,
      params,
      headers: this.headers,
    };
    this.beforeSends.forEach((handler) => {
      handler(config);
    });
    const result = await request.delete(
      config.url,
      config.params,
      config.headers
    );
    this.afterReceives.forEach((handler) => {
      handler(result);
    });
    return result;
  }
}
const handler = {
  get(
    target: {
      $action: string | undefined;
      $controller: Controller;
    },
    property: string,
    receiver: any
  ) {
    const controller = target.$controller;
    if (property in controller) {
      return controller[property];
    }
    let match = controller.parseActionsRegExp.exec(property);

    let $action: string | undefined = undefined;
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
  apply(
    target: {
      $action: string | undefined;
      $controller: Controller;
    },
    thisArg: any,
    argumentsList: any[]
  ): any {
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
export function createController(
  name: string,
  baseUrl: string,
  headers: ApiHeaders = {},
  beforeSends: BeforeSendHandler[] = [],
  afterReceives: Array<(result: any) => any> = [],
  actionsMap?: Record<string, string | boolean | string[]>,
  parseActions?: Array<string>,
  $action?: string
): ApiProxy {
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
  return new Proxy(func, handler) as unknown as ApiProxy;
}

export default {
  create: createController,
};
