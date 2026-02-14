import AuthServiceMethods from "./auth/auth-service.methods";
import CategoriesServiceMethods from "./categories/categories-service.methods";
import CustomersServiceMethods from "./customers/customers-service.methods";
import EmployeesServiceMethods from "./employees/employees-service.methods";
import FilesUploadsServiceMethods from "./files-uploads/files-uploads-service.methods";
import FilesServiceMethods from "./files/files-service.methods";
import NotificationsServiceMethods from "./notifications/notifications-service.methods";
import ProductItemsServiceMethods from "./product-items/product-items-service.methods";
import ProductsServiceMethods from "./products/products-service.methods";
import SalesServiceMethods from "./sales/sales-service.methods";
import StoresServiceMethods from "./stores/stores-service.methods";
import TagsServiceMethods from "./tags/tags-service.methods";
import UsersServiceMethods from "./users/users-service.methods";

export default class ServiceMethods {
  public authServiceMethods: AuthServiceMethods;
  public usersServiceMethods: UsersServiceMethods;
  public storesServiceMethods: StoresServiceMethods;
  public productsServiceMethods: ProductsServiceMethods;
  public productItemsServiceMethods: ProductItemsServiceMethods;
  public categoriesServiceMethods: CategoriesServiceMethods;
  public customersServiceMethods: CustomersServiceMethods;
  public notificationsServiceMethods: NotificationsServiceMethods;
  public salesServiceMethods: SalesServiceMethods;
  public tagsServiceMethods: TagsServiceMethods;
  public employeesServiceMethods: EmployeesServiceMethods;
  public filesServiceMethods: FilesServiceMethods;
  public filesUploadsServiceMethods: FilesUploadsServiceMethods;

  constructor() {
    this.authServiceMethods = new AuthServiceMethods();
    this.usersServiceMethods = new UsersServiceMethods();
    this.storesServiceMethods = new StoresServiceMethods();
    this.productsServiceMethods = new ProductsServiceMethods();
    this.productItemsServiceMethods = new ProductItemsServiceMethods();
    this.categoriesServiceMethods = new CategoriesServiceMethods();
    this.customersServiceMethods = new CustomersServiceMethods();
    this.notificationsServiceMethods = new NotificationsServiceMethods();
    this.salesServiceMethods = new SalesServiceMethods();
    this.tagsServiceMethods = new TagsServiceMethods();
    this.employeesServiceMethods = new EmployeesServiceMethods();
    this.filesServiceMethods = new FilesServiceMethods();
    this.filesUploadsServiceMethods = new FilesUploadsServiceMethods();
  }
}

export const serviceMethodsInstance = new ServiceMethods();
