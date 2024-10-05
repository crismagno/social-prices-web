namespace AuthServiceEnum {
  export enum Methods {
    SIGN_IN = "/auth/signIn",
    SIGN_IN_EMPLOYEE = "/auth/signInEmployee",
    SEARCH_EMPLOYEES = "/auth/searchEmployees/:emailOrUsername",
    SIGN_UP = "/auth/signUp",
    VALIDATE_TOKEN = "/auth/validateToken",
    VALIDATE_SIGN_IN_CODE = "/auth/validateSignInCode/:codeValue",
    VALIDATE_SIGN_IN_EMPLOYEE_CODE = "/auth/validateSignInEmployeeCode/:codeValue",
  }
}

export default AuthServiceEnum;
