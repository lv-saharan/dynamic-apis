import request from './request.js'

class Controller {
  #tableName = ''
  #controllerURL = ''
  #headers = {}
  constructor(name, baseUrl, headers) {
    name = name + ""
    if (name.startsWith('/')) {
      name = name.substr(1)
    }
    this.#headers = headers ?? {}
    this.#tableName = name
    this.#controllerURL = new URL(name, baseUrl).href
  }
  get headers() {
    return this.#headers
  }
  get controllerURL() {
    return this.#controllerURL
  }
  id(id) {
    return createController(id, this.controllerURL + "/", this.headers)
  }
  path(path) {
    return createController(path, this.controllerURL + "/", this.headers)
  }
  /**
   * id可以是一个id，或者为空，或者一个查询
   * @param {*} id
   */
  async get(id) {
    let url = `${this.controllerURL}`
    let data = null
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(',')}`
    } else if (typeof id == 'object') {
      data = id
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(',')}`
    }

    return request.get(url, data, this.headers)
  }
  /**
   * 新增
   * @param {*} item
   */
  async post(item) {
    return request.post(this.controllerURL, item, this.headers)
  }

  /**
   * 更新全部
   * @param {*} id
   * @param {*} item
   */
  async put(id, item) {
    if (item == undefined) {
      throw new Error('参数数量不对')
    }
    return request.put(`${this.controllerURL}/${id}`, item, this.headers)
  }

  /**
   * 更新部分
   * @param {*} id
   * @param {*} item
   */
  async patch(id, item) {
    if (item == undefined) {
      throw new Error('参数数量不对')
    }
    return request.patch(`${this.controllerURL}/${id}`, item, this.headers)
  }

  /**
   * id可以是一个id，或者一个数组，或者一个查询
   * @param {*} id
   */
  async delete(id) {
    let url = `${this.controllerURL}`
    let data = null
    if (id instanceof Array) {
      url = `${this.controllerURL}/${id.join(',')}`
    } else if (typeof id == 'object') {
      data = id
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(',')}`
    }

    return request.delete(url, data, this.headers)
  }
  add = this.post
  update = this.put
  modify = this.patch
  del = this.delete
}
const handler = {
  get(target, property, receiver) {
    if (property in target) {
      return target[property]
    }
    let match = /^(?<action>get|add|post|update|put|patch|modify|del|delete)(?<name>\w+)/i.exec(
      property
    )
    if (match) {
      let [first, ...rest] = match.groups.name
      let name = [first.toLowerCase(), ...rest].join('')
      let controller = new Controller(name, target.controllerURL + '/', target.headers)
      return controller[match.groups.action].bind(controller)
    }
    return createController(property, target.controllerURL + '/', target.headers)
  }
}
export const createController = (name, baseUrl, headers) => {
  return new Proxy(new Controller(name, baseUrl, headers), handler)
}

export default {
  create: createController
}
