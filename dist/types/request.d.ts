import { ApiHeaders, ApiParams } from "./definitions";
export declare const buildURL: (url: string, params?: ApiParams) => string;
export declare const request: {
    get(url: string, params?: ApiParams, headers?: ApiHeaders): Promise<any>;
    post(url: string, params?: ApiParams, headers?: ApiHeaders, data?: any): Promise<any>;
    put(url: string, params?: ApiParams, headers?: ApiHeaders, data?: any): Promise<any>;
    patch(url: string, params?: ApiParams, headers?: ApiHeaders, data?: any): Promise<any>;
    delete(url: string, params?: ApiParams, headers?: ApiHeaders): Promise<any>;
};
export default request;
