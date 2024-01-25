const Urls = {
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  LOGOUT: "/logout",
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",
  VALIDATE_SIGN_IN_CODE: "/validate-sign-in-code",
  RECOVER_PASSWORD: "/recover-password",
  UPDATE_EMAIL: "/update-email",
  UPDATE_USERNAME: "/update-username",

  // profile
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",

  // stores
  STORES: "/stores",
  NEW_STORE: "/stores/detail",
  EDIT_STORE: "/stores/detail?sid=:storeId",
  // stores products
  STORE_PRODUCTS: "/stores/:storeId/products",
  STORE_NEW_PRODUCT: "/stores/:storeId/products/detail",
  STORE_EDIT_PRODUCT: "/stores/:storeId/products/detail?pid=:productId",
};

export default Urls;
