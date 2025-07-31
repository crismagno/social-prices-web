namespace SalesServiceEnum {
  export enum Methods {
    FIND_BY_ID = "/sales/:saleId",
    COUNT_BY_USER = "/sales/user/count",
    FIND_BY_USER_TABLE_STATE = "/sales/userTableState",
    GET_SALES_SUMMARY_BY_USER_TABLE_STATE = "/sales/getSalesSummaryByUserTableState",
    CREATE_MANUAL = "/sales/createManual",
    UPDATE_MANUAL = "/sales/updateManual",
    DELETE_MANUAL = "/sales/deleteManual/:saleId",
    GET_SALES_ANALYTICS = "/sales/getSalesAnalytics",
    GET_SALES_BALANCE = "/sales/getSalesBalance",
    UPLOAD_SALES = "/sales/uploadSales",
    DOWNLOAD_SALES = "/sales/downloadSales",
  }
}

export default SalesServiceEnum;
