namespace FilesUploadsEnum {
  export enum Type {
    UPLOAD_CUSTOMERS = "UPLOAD_CUSTOMERS",
    UPLOAD_PRODUCTS = "UPLOAD_PRODUCTS",
    UPLOAD_PRODUCT_ITEMS = "UPLOAD_PRODUCT_ITEMS",
    UPLOAD_EMPLOYEES = "UPLOAD_EMPLOYEES",
    UPLOAD_SALES = "UPLOAD_SALES",
  }

  export enum Status {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    ERROR = "ERROR",
  }

  export const StatusLabels = {
    [Status.PENDING]: "filesUploads.pending",
    [Status.PROCESSING]: "filesUploads.processing",
    [Status.COMPLETED]: "filesUploads.completed",
    [Status.ERROR]: "filesUploads.error",
  };

  export const StatusColors = {
    [Status.PENDING]: "gray",
    [Status.PROCESSING]: "blue",
    [Status.COMPLETED]: "green",
    [Status.ERROR]: "red",
  };

  export const TypeLabels = {
    [Type.UPLOAD_CUSTOMERS]: "filesUploads.uploadCustomers",
    [Type.UPLOAD_PRODUCTS]: "filesUploads.uploadProducts",
    [Type.UPLOAD_PRODUCT_ITEMS]: "filesUploads.uploadProductItems",
    [Type.UPLOAD_EMPLOYEES]: "filesUploads.uploadEmployees",
    [Type.UPLOAD_SALES]: "filesUploads.uploadSales",
  };
}

export default FilesUploadsEnum;
