const Urls = {
  ROOT: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  LOGIN_EMPLOYEE: "/login-employee",
  LOGOUT: "/logout",
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",
  VALIDATE_SIGN_IN_CODE: "/validate-sign-in-code",
  VALIDATE_SIGN_IN_EMPLOYEE_CODE: "/validate-sign-in-employee-code",
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
  PRODUCT: "/products/:productId",

  // product-items
  PRODUCT_ITEMS: "/product-items",
  NEW_PRODUCT_ITEM: "/product-items/detail",
  EDIT_PRODUCT_ITEM: "/product-items/detail?piid=:productItemId",
  PRODUCT_ITEM: "/product-items/:productItemId",

  // customers
  CUSTOMERS: "/customers",
  NEW_CUSTOMER: "/customers/detail",
  EDIT_CUSTOMER: "/customers/detail?cid=:customerId",
  CUSTOMER: "/customers/:customerId",

  // sales
  SALES: "/sales",
  SALES_CREATE: "/sales/create",
  SALES_EDIT: "/sales/create?said=:saleId",
  SALES_CREATE_BY_CUSTOMER: "/sales/create?cid=:customerId",
  SALES_CREATE_BY_STORE: "/sales/create?sid=:storeId",
  SALES_CREATE_BY_PRODUCT: "/sales/create?pid=:productId",
  SALES_CREATE_BY_PRODUCT_ITEM: "/sales/create?piid=:productItemId",
  SALES_CREATE_BY_PRODUCT_AND_STORE:
    "/sales/create?pid=:productId&sid=:storeId",
  SALES_CREATE_BY_PRODUCT_AND_CUSTOMER:
    "/sales/create?pid=:productId&cid=:customerId",
  SALE: "/sales/:saleId",

  // categories
  CATEGORIES: "/categories",

  // tags
  TAGS: "/tags",

  // employees
  EMPLOYEES: "/employees",
  NEW_EMPLOYEE: "/employees/detail",
  EDIT_EMPLOYEE: "/employees/detail?empid=:employeeId",
  EMPLOYEE: "/employees/:employeeId",

  // download
  DOWNLOAD_SALE_SUMMARY: "/download/sales/summary?i=:tokenId",
};

export default Urls;
