import ManagersEnum from "../../../../shared/business/managers/managers.enum";

export default class UpdateManagerDto {
  _id: string = "";
  name: string = "";
  birthDate: Date | null = null;
  level: ManagersEnum.Level = ManagersEnum.Level.SUB_MANAGER;
  isActive: boolean = true;
}
