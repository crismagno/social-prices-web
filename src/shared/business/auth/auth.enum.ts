namespace AuthEnum {
  export enum AuthErrors {
    UNAUTHORIZED = "UNAUTHORIZED",
  }

  export enum AuthTypes {
    NO_TOKEN = "NO_TOKEN",
    PAYLOAD_ERROR = "PAYLOAD_ERROR",
    LOGIN_VALIDATION = "LOGIN_VALIDATION",
  }

  export enum StatusText {
    Unauthorized = "Unauthorized",
  }

  export enum Status {
    Unauthorized = 401,
  }
}

export default AuthEnum;
