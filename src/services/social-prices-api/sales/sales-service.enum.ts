namespace SalesServiceEnum {
  export enum Methods {
    FIND_BY_ID = "/sales/:saleId",
    COUNT_BY_USER = "/sales/user/count",
    FIND_BY_USER_TABLE_STATE = "/sales/userTableState",
    GET_SALES_SUMMARY_BY_USER_TABLE_STATE = "/sales/getSalesSummaryByUserTableState",
    CREATE_MANUAL = "/sales/createManual",
    UPDATE_MANUAL = "/sales/updateManual",
    DELETE_MANUAL = "/sales/deleteManual/:saleId",
    ACTIVATE_MANUAL = "/sales/activateManual/:saleId",
    GET_SALES_ANALYTICS = "/sales/getSalesAnalytics",
    GET_SALES_BALANCE = "/sales/getSalesBalance",
    UPLOAD_SALES = "/sales/uploadSales",
    DOWNLOAD_SALES = "/sales/downloadSales",
    DOWNLOAD_SALE_SUMMARY_PDF = "/sales/downloadSaleSummaryPdf/:saleId",
    UPDATE_STATUS_MANUAL = "/sales/updateStatusManual",
    UPDATE_PAYMENT_STATUS_MANUAL = "/sales/updatePaymentStatusManual",
    UPDATE_SALE_CUSTOMER_MANUAL = "/sales/updateSaleCustomerManual",
    UPDATE_SALE_FILES = "/sales/updateSaleFiles",
    SEND_SALE_SUMMARY_LINK = "/sales/sendSaleSummaryLink",
    GET_SALE_BY_SALE_SUMMARY_LINK_TOKEN = "/sales/getSaleBySaleSummaryLinkToken/:token",
  }
}

export default SalesServiceEnum;
