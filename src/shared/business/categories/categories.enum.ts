namespace CategoriesEnum {
  export enum Type {
    PRODUCT = "PRODUCT",
    SALE = "SALE",
    STORE = "STORE",
    TRANSACTION = "TRANSACTION",
  }

  export const TypeLabels = {
    [Type.PRODUCT]: "products.product",
    [Type.SALE]: "sales.sale",
    [Type.STORE]: "stores.store",
    [Type.TRANSACTION]: "transactions.transaction",
  };
}

export default CategoriesEnum;
