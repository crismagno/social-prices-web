namespace AuthServiceEnum {
  export enum Methods {
    SIGN_IN = "/auth/signIn",
    SIGN_UP = "/auth/signUp",
    VALIDATE_TOKEN = "/auth/validateToken",
    VALIDATE_SIGN_IN_CODE = "/auth/validateSignInCode/:codeValue",
  }
}

export default AuthServiceEnum;
