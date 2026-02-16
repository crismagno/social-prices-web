namespace ProductItemsServiceEnum {
  export enum Methods {
    CREATE = "/product-items",
    UPDATE = "/product-items",
    FIND_BY_ID = "/product-items/:productItemId",
    FIND_BY_PRODUCT = "/product-items/product/:productId",
    FIND_BY_USER = "/product-items/user",
    FIND_BY_USER_TABLE_STATE = "/product-items/userTableState",
    UPLOAD_PRODUCT_ITEMS = "/product-items/uploadProductItems",
  }
}

export default ProductItemsServiceEnum;
