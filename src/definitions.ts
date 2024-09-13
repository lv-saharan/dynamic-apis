import { Controller } from "./controller";

export type ApiHeaders = Record<string, string | (() => string)>;
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface ApiParams {
  [key: string]: string | string[] | null | number | ApiParams;
}
export type BeforeSendConfig = {
  url: string;
  method: ApiMethod;
  params?: ApiParams;
  data?: any;
  headers?: ApiHeaders;
};
export type BeforeSendHandler = (config: BeforeSendConfig) => void;

export interface ApiController {
  // get headers(): ApiHeaders;

  // get controllerURL(): string;
  // get beforeSends(): BeforeSendHandler[];

  // get afterReceives(): Array<(result: any) => any>;
  // get actionsMap(): Record<string, string | boolean | string[]>;
  // beforeSend(handler: BeforeSendHandler): void;
  // afterReceive(handler: (result: any) => any): void;
  id(id: string | number): ApiController;
  path(path: string | number): ApiController;

  get<T = any>(
    id?: string | number | ApiParams | Array<string | number>
  ): Promise<T>;

  post<T = any>(data?: any, params?: ApiParams): Promise<T>;

  /**
   * update
   * @param {*} id
   * @param {*} data
   */
  put<T = any>(
    id: string | number | object | undefined,
    data?: any,
    params?: ApiParams
  ): Promise<T>;

  /**
   * patch
   * @param {*} id
   * @param {*} data
   */
  patch<T = any>(
    id: string | number | object | undefined,
    data?: any,
    params?: ApiParams
  ): Promise<T>;

  /**
   * id可以是一个id，或者一个数组，或者一个查询
   * @param {*} id
   */
  delete<T = any>(
    id: string | number | undefined | Array<string | number> | ApiParams
  ): Promise<T>;
}

type ApiFunction = <T>(arg?: any) => ApiProxy &
  (T extends string
    ? {
        [K in T]: ApiProxy;
      }
    : T extends Record<string, any>
    ? {
        [K in keyof T]: ApiProxy;
      }
    : {});

export type ApiProxy = ApiController & {
  [K: string]: ApiProxy;
} & ApiFunction;
