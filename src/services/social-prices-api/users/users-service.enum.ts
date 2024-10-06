namespace UsersServiceEnum {
  export enum Methods {
    SEND_RECOVER_PASSWORD_CODE = "/users/sendRecoverPasswordCode/:email",
    RECOVER_PASSWORD = "/users/recoverPassword",
    UPDATE_USER = "/users/updateUser",
    UPDATE_USER_ADDRESSES = "/users/updateUserAddresses",
    UPDATE_USER_PHONE_NUMBERS = "/users/updateUserPhoneNumbers",
    UPLOAD_AVATAR = "/users/uploadAvatar",
    GET_AVATAR_IMAGE = "/users/avatars",
    REMOVE_AVATAR = "/users/removeAvatar",
    SEND_UPDATE_EMAIL_CODE = "/users/sendUpdateEmailCode/:email",
    UPDATE_EMAIL = "/users/updateEmail",
  }
}

export default UsersServiceEnum;
