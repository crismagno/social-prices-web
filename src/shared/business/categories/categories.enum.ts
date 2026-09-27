namespace CategoriesEnum {
  export enum Type {
    PRODUCT = "PRODUCT",
    SALE = "SALE",
    STORE = "STORE",
    TRANSACTION = "TRANSACTION",
    NOTE = "NOTE",
  }

  export const TypeLabels = {
    [Type.PRODUCT]: "products.product",
    [Type.SALE]: "sales.sale",
    [Type.STORE]: "stores.store",
    [Type.TRANSACTION]: "transactions.transaction",
    [Type.NOTE]: "notes.note",
  };
}

export default CategoriesEnum;
