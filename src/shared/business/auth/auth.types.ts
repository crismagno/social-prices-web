import { IEmployee } from "../employees/employee.interface";
import IUser from "../users/user.interface";

export interface IAuthLogin {
  user: IUser;
  employee: IEmployee;
  authToken: string;
}

export interface IAuthUserEmployee {
  user: IUser;
  employee: IEmployee;
}
