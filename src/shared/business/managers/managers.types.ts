import { IManager } from "./manager.interface";
import ManagersEnum from "./managers.enum";

export interface IManagerAuthLogin {
  manager: IManager;
  authToken: string;
}

export interface IManagersTableFilters {
  level?: ManagersEnum.Level[];
  isActive?: boolean[];
  isDeleted?: boolean;
}
