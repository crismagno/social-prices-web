namespace TagsEnum {
  export enum Type {
    STORE = "STORE",
    SALE = "SALE",
    ANY = "ANY",
    PRODUCT = "PRODUCT",
    CUSTOMER = "CUSTOMER",
    EMPLOYEE = "EMPLOYEE",
    TRANSACTION = "TRANSACTION",
  }

  export const TypeLabels = {
    [Type.STORE]: "stores.store",
    [Type.SALE]: "sales.sale",
    [Type.ANY]: "common.any",
    [Type.PRODUCT]: "products.product",
    [Type.CUSTOMER]: "customers.customer",
    [Type.EMPLOYEE]: "employees.employee",
    [Type.TRANSACTION]: "transactions.transaction",
  };

  export const defaultTagColor: string = "black";
  export const defaultTagSize: number = 30;
}

export default TagsEnum;
