namespace AppsServiceEnum {
  export enum Methods {
    FIND_CATALOG = "/apps",
    CONNECT = "/apps/:appId/connect",
    SYNC = "/apps/:appId/sync",
    IMPORT = "/apps/:appId/import",
    DISCONNECT = "/apps/:appId/connection",
  }
}

export default AppsServiceEnum;
