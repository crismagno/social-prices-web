import { IEmployee } from "../../business/employees/employee.interface";
import UsersEnum from "../../business/users/users.enum";
import IUser from "../../business/users/user.interface";
import Urls from "./routes-app";

// Only the owner of a company can look at the account as a customer; the
// account's type itself never changes from here.
export const canSwitchToCustomerView = (
  user: IUser | null | undefined,
  employee: IEmployee | null | undefined,
): boolean => user?.type === UsersEnum.Type.COMPANY && !!employee?.isMain;

// Whether the customer screens are shown: a CUSTOMER account always, a company
// owner while they chose the customer view.
export const isCustomerView = (
  user: IUser | null | undefined,
  employee: IEmployee | null | undefined,
  viewMode: UsersEnum.Type,
): boolean =>
  user?.type === UsersEnum.Type.CUSTOMER ||
  (canSwitchToCustomerView(user, employee) &&
    viewMode === UsersEnum.Type.CUSTOMER);

// Where an account lands: customers have their own area.
export const homeUrlFor = (isCustomer: boolean): string =>
  isCustomer ? Urls.CUSTOMER_DASHBOARD : Urls.DASHBOARD;
