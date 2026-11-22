namespace StoreSitesServiceEnum {
  export enum Methods {
    FIND_BY_STORE_ID = "/store-sites/store/:storeId",
    SAVE = "/store-sites/store/:storeId",
    SLUG_AVAILABLE = "/store-sites/slug-available/:slug",
    PUBLISH = "/store-sites/store/:storeId/publish",
    UNPUBLISH = "/store-sites/store/:storeId/unpublish",
    UPLOAD_IMAGE = "/store-sites/store/:storeId/images",
    PUBLIC_FIND_BY_SLUG = "/public/store-sites/:slug",
    PUBLIC_CREATE_ORDER = "/public/store-sites/:slug/orders",
  }
}

export default StoreSitesServiceEnum;
