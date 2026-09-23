namespace ManagerAuthServiceEnum {
  export enum Methods {
    SIGN_IN = "/manager-auth/signIn",
    VALIDATE_SIGN_IN_CODE = "/manager-auth/validateSignInCode/:codeValue",
    GET_AUTH_MANAGER_BY_TOKEN = "/manager-auth/getAuthManagerByToken",
    SEND_RECOVER_PASSWORD_CODE = "/manager-auth/sendRecoverPasswordCode/:email",
    RECOVER_PASSWORD = "/manager-auth/recoverPassword",
  }
}

export default ManagerAuthServiceEnum;
