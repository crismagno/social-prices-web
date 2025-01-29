import IUser from "../../../business/users/user.interface";
import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageUserMethods {
  public getUser = (): IUser | null => {
    const item: string | null = localStorage.getItem(
      LocalStorageEnum.keys.USER
    );

    if (item) {
      return JSON.parse(item) as IUser;
    }

    return null;
  };

  public setUser = (user: IUser): void => {
    localStorage.setItem(LocalStorageEnum.keys.USER, JSON.stringify(user));
  };

  public removeUser = (): void => {
    localStorage.removeItem(LocalStorageEnum.keys.USER);
  };
}
