import LocalStorageAuthTokenMethods from "./methods/local-storage-auth-token.methods";
import LocalStorageEmployeeMethods from "./methods/local-storage-employee.methods";
import LocalStorageThemeMethods from "./methods/local-storage-theme.methods";
import LocalStorageUserMethods from "./methods/local-storage-user.methods";

export default class LocalStorageMethods {
  public localStorageAuthTokenMethods: LocalStorageAuthTokenMethods;
  public localStorageEmployeeMethods: LocalStorageEmployeeMethods;
  public localStorageThemeMethods: LocalStorageThemeMethods;
  public localStorageUserMethods: LocalStorageUserMethods;

  constructor() {
    this.localStorageAuthTokenMethods = new LocalStorageAuthTokenMethods();
    this.localStorageEmployeeMethods = new LocalStorageEmployeeMethods();
    this.localStorageThemeMethods = new LocalStorageThemeMethods();
    this.localStorageUserMethods = new LocalStorageUserMethods();
  }
}

export const localStorageMethodsInstance = new LocalStorageMethods();
