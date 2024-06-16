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
  STORE: "/stores/:storeId",

  // products
  PRODUCTS: "/products",
  NEW_PRODUCT: "/products/detail",
  EDIT_PRODUCT: "/products/detail?pid=:productId",

  // products
  CUSTOMERS: "/customers",
  NEW_CUSTOMER: "/customers/detail",
  EDIT_CUSTOMER: "/customers/detail?cid=:customerId",

  // sales
  SALES: "/sales",
  SALES_CREATE: "/sales/create",
  SALES_EDIT: "/sales/create?said=:saleId",

  // sales
  CATEGORIES: "/categories",
};

export default Urls;
