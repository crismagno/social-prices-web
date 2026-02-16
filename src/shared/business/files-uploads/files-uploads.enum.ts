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
    [Status.PENDING]: "Pending",
    [Status.PROCESSING]: "Processing",
    [Status.COMPLETED]: "Completed",
    [Status.ERROR]: "Error",
  };

  export const StatusColors = {
    [Status.PENDING]: "gray",
    [Status.PROCESSING]: "blue",
    [Status.COMPLETED]: "green",
    [Status.ERROR]: "red",
  };

  export const TypeLabels = {
    [Type.UPLOAD_CUSTOMERS]: "Upload Customers",
    [Type.UPLOAD_PRODUCTS]: "Upload Products",
    [Type.UPLOAD_PRODUCT_ITEMS]: "Upload Product Items",
    [Type.UPLOAD_EMPLOYEES]: "Upload Employees",
    [Type.UPLOAD_SALES]: "Upload Sales",
  };
}

export default FilesUploadsEnum;
