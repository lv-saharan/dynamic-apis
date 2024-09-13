import request from "./request";
import { createController, Controller } from "./controller";
declare const _default: {
    request: {
        get(url: string, params?: import("./definitions").ApiParams | undefined, headers?: import("./definitions").ApiHeaders | undefined): Promise<any>;
        post(url: string, params?: import("./definitions").ApiParams | undefined, headers?: import("./definitions").ApiHeaders | undefined, data?: any): Promise<any>;
        put(url: string, params?: import("./definitions").ApiParams | undefined, headers?: import("./definitions").ApiHeaders | undefined, data?: any): Promise<any>;
        patch(url: string, params?: import("./definitions").ApiParams | undefined, headers?: import("./definitions").ApiHeaders | undefined, data?: any): Promise<any>;
        delete(url: string, params?: import("./definitions").ApiParams | undefined, headers?: import("./definitions").ApiHeaders | undefined): Promise<any>;
    };
    createController: typeof createController;
    Controller: typeof Controller;
};
export default _default;
export { request, createController, Controller };
