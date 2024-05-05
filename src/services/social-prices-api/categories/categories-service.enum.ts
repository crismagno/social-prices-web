namespace CategoriesServiceEnum {
  export enum Methods {
    FIND_BY_TYPE = "/categories/type/:type",
    FIND_BY_ID = "/categories/:categoryId",
    CREATE = "/categories",
    UPDATE = "/categories",
    FIND_BY_USER_TABLE_STATE = "/categories/userTableState",
    CREATE_MULTI = "/categories/multi",
  }
}

export default CategoriesServiceEnum;
