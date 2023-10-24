import AuthServiceMethods from "./auth/auth-service.methods";
import UsersServiceMethods from "./users/user-service.methods";

export default class ServiceMethods {
  public authServiceMethods: AuthServiceMethods;
  public usersServiceMethods: UsersServiceMethods;

  constructor() {
    this.authServiceMethods = new AuthServiceMethods();
    this.usersServiceMethods = new UsersServiceMethods();
  }
}

export const serviceMethodsInstance = new ServiceMethods();
