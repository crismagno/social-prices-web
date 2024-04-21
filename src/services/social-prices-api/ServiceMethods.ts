import AuthServiceMethods from "./auth/auth-service.methods";
import CategoriesServiceMethods from "./categories/categories-service.methods";
import CustomersServiceMethods from "./customers/customers-service.methods";
import ProductsServiceMethods from "./products/products-service.methods";
import StoresServiceMethods from "./stores/stores-service.methods";
import UsersServiceMethods from "./users/users-service.methods";

export default class ServiceMethods {
  public authServiceMethods: AuthServiceMethods;
  public usersServiceMethods: UsersServiceMethods;
  public storesServiceMethods: StoresServiceMethods;
  public productsServiceMethods: ProductsServiceMethods;
  public categoriesServiceMethods: CategoriesServiceMethods;
  public customersServiceMethods: CustomersServiceMethods;

  constructor() {
    this.authServiceMethods = new AuthServiceMethods();
    this.usersServiceMethods = new UsersServiceMethods();
    this.storesServiceMethods = new StoresServiceMethods();
    this.productsServiceMethods = new ProductsServiceMethods();
    this.categoriesServiceMethods = new CategoriesServiceMethods();
    this.customersServiceMethods = new CustomersServiceMethods();
  }
}

export const serviceMethodsInstance = new ServiceMethods();
