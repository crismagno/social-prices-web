namespace ProductsServiceEnum {
  export enum Methods {
    CREATE = "/products",
    UPDATE = "/products",
    FIND_BY_ID = "/products/:productId",
    FIND_BY_USER = "/products/user",
    FIND_BY_USER_TABLE_STATE = "/products/userTableState",
    COUNT_BY_USER = "/products/user/count",
  }
}

export default ProductsServiceEnum;
