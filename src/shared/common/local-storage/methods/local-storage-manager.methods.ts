import { IManager } from "../../../business/managers/manager.interface";
import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageManagerMethods {
  public getManager = (): IManager | null => {
    const item: string | null = localStorage.getItem(
      LocalStorageEnum.keys.MANAGER
    );

    if (item) {
      return JSON.parse(item) as IManager;
    }

    return null;
  };

  public setManager = (manager: IManager): void => {
    localStorage.setItem(
      LocalStorageEnum.keys.MANAGER,
      JSON.stringify(manager)
    );
  };

  public removeManager = (): void => {
    localStorage.removeItem(LocalStorageEnum.keys.MANAGER);
  };
}
