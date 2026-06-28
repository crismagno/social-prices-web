namespace CategoriesEnum {
  export enum Type {
    PRODUCT = "PRODUCT",
    SALE = "SALE",
    STORE = "STORE",
  }

  export const TypeLabels = {
    [Type.PRODUCT]: "products.product",
    [Type.SALE]: "sales.sale",
    [Type.STORE]: "stores.store",
  };
}

export default CategoriesEnum;
