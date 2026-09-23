import ManagersEnum from "./managers.enum";

export interface IManager {
  _id: string;
  name: string;
  email: string;
  birthDate: Date | null;
  level: ManagersEnum.Level;
  isActive: boolean;
  isMain: boolean;
  createdByManagerId: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
