import LocalStorageAuthTokenMethods from "./methods/local-storage-auth-token.methods";
import LocalStorageEmployeeMethods from "./methods/local-storage-employee.methods";
import LocalStorageManagerAuthTokenMethods from "./methods/local-storage-manager-auth-token.methods";
import LocalStorageManagerMethods from "./methods/local-storage-manager.methods";
import LocalStorageSidebarMethods from "./methods/local-storage-sidebar.methods";
import LocalStorageThemeMethods from "./methods/local-storage-theme.methods";
import LocalStorageUserMethods from "./methods/local-storage-user.methods";

export default class LocalStorageMethods {
  public localStorageAuthTokenMethods: LocalStorageAuthTokenMethods;
  public localStorageEmployeeMethods: LocalStorageEmployeeMethods;
  public localStorageManagerMethods: LocalStorageManagerMethods;
  public localStorageManagerAuthTokenMethods: LocalStorageManagerAuthTokenMethods;
  public localStorageSidebarMethods: LocalStorageSidebarMethods;
  public localStorageThemeMethods: LocalStorageThemeMethods;
  public localStorageUserMethods: LocalStorageUserMethods;

  constructor() {
    this.localStorageAuthTokenMethods = new LocalStorageAuthTokenMethods();
    this.localStorageEmployeeMethods = new LocalStorageEmployeeMethods();
    this.localStorageManagerMethods = new LocalStorageManagerMethods();
    this.localStorageManagerAuthTokenMethods =
      new LocalStorageManagerAuthTokenMethods();
    this.localStorageSidebarMethods = new LocalStorageSidebarMethods();
    this.localStorageThemeMethods = new LocalStorageThemeMethods();
    this.localStorageUserMethods = new LocalStorageUserMethods();
  }
}

export const localStorageMethodsInstance = new LocalStorageMethods();
