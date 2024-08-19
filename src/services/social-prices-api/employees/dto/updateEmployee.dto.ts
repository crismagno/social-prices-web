import EmployeesEnum from "../../../../shared/business/employees/employees.enum";
import PersonEnum from "../../../../shared/business/enums/person.enum";

export default class UpdateEmployeeDto {
  employeeId: string = "";
  name: string = "";
  email: string = "";
  password: string | null = null;
  birthDate: Date | null = null;
  gender: PersonEnum.Gender | null = null;
  level: EmployeesEnum.Level = EmployeesEnum.Level.EMPLOYEE;
  addresses: any[] = [];
  phoneNumbers: any[] = [];
  tagsIds: string[] = [];
  about: string | null = null;
}
