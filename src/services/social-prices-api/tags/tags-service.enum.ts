namespace TagsServiceEnum {
  export enum Methods {
    CREATE = "/tags",
    CREATE_MULTI = "/tags/multi",
    UPDATE = "/tags",
    FIND_BY_ID = "/tags/:tagId",
    FIND_BY_TYPE = "/tags/user/:userId/type/:type",
    FIND_BY_USER_TABLE_STATE = "/tags/userTableState/user/:userId",
  }
}

export default TagsServiceEnum;
