namespace UsersServiceEnum {
  export enum Methods {
    GET_USER = "/users/getUser",
    GET_USER_BY_TOKEN = "/users/getUserByToken",
    SEND_RECOVER_PASSWORD_CODE = "/users/sendRecoverPasswordCode",
    RECOVER_PASSWORD = "/users/recoverPassword",
    UPDATE_USER = "/users/updateUser",
    UPDATE_USER_ADDRESSES = "/users/updateUserAddresses",
    UPDATE_USER_PHONE_NUMBERS = "/users/updateUserPhoneNumbers",
  }
}

export default UsersServiceEnum;
