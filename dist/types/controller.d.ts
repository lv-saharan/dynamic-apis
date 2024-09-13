import { ApiHeaders, BeforeSendHandler, ApiProxy, ApiParams, ApiController } from "./definitions";
export declare class Controller implements ApiController {
    #private;
    [key: string]: any;
    constructor(name: string, baseUrl: string, headers?: ApiHeaders, beforeSends?: Array<BeforeSendHandler>, afterReceives?: Array<(result: any) => any>, actionsMap?: Record<string, string | boolean | string[]>, parseActions?: Array<string>);
    get headers(): ApiHeaders;
    get controllerURL(): string;
    get beforeSends(): BeforeSendHandler[];
    get afterReceives(): ((result: any) => any)[];
    get actionsMap(): Record<string, string | boolean | string[]>;
    get parseActionsRegExp(): RegExp;
    id(id: string | number): ApiProxy;
    path(path: string | number): ApiProxy;
    beforeSend(handler: BeforeSendHandler): void;
    afterReceive(handler: (result: any) => any): void;
    /**
     * id可以是一个id，或者为空，或者一个查询
     * @param {*} id
     */
    get(id?: string | number | ApiParams | Array<string | number>): Promise<any>;
    /**
     * 新增
     * @param {*} data
     */
    post(data?: any, params?: ApiParams): Promise<any>;
    /**
     * update
     * @param {*} id
     * @param {*} data
     */
    put(id: string | number | object | undefined, data?: any, params?: ApiParams): Promise<any>;
    /**
     * patch
     * @param {*} id
     * @param {*} data
     */
    patch(id: string | number | object | undefined, data?: any, params?: ApiParams): Promise<any>;
    /**
     * id可以是一个id，或者一个数组，或者一个查询
     * @param {*} id
     */
    delete(id: string | number | undefined | Array<string | number> | ApiParams): Promise<any>;
}
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
export declare function createController(name: string, baseUrl: string, headers?: ApiHeaders, beforeSends?: BeforeSendHandler[], afterReceives?: Array<(result: any) => any>, actionsMap?: Record<string, string | boolean | string[]>, parseActions?: Array<string>, $action?: string): ApiProxy;
declare const _default: {
    create: typeof createController;
};
export default _default;
