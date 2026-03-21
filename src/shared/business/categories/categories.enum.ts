namespace CategoriesEnum {
  export enum Type {
    PRODUCT = "PRODUCT",
    STORE = "STORE",
  }

  export const TypeLabels = {
    [Type.PRODUCT]: "products.product",
    [Type.STORE]: "stores.store",
  };
}

export default CategoriesEnum;
