import ManagersEnum from "../../../../shared/business/managers/managers.enum";

export default class CreateManagerDto {
  name: string = "";
  email: string = "";
  password: string = "";
  birthDate: Date | null = null;
  level: ManagersEnum.Level = ManagersEnum.Level.SUB_MANAGER;
}
