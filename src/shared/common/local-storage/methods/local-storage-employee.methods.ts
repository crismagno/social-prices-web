import { IEmployee } from "../../../business/employees/employee.interface";
import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageEmployeeMethods {
  public static getEmployee = (): IEmployee | null => {
    const item: string | null = localStorage.getItem(
      LocalStorageEnum.keys.EMPLOYEE
    );

    if (item) {
      return JSON.parse(item) as IEmployee;
    }

    return null;
  };

  public static setEmployee = (employee: IEmployee | null): void => {
    localStorage.setItem(
      LocalStorageEnum.keys.EMPLOYEE,
      JSON.stringify(employee)
    );
  };

  public static removeEmployee = (): void => {
    localStorage.removeItem(LocalStorageEnum.keys.EMPLOYEE);
  };
}
