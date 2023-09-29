import IUser from "../../../business/users/user.interface";
import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageUserMethods {
  public static getUser = (): IUser | null => {
    const item: string | null = localStorage.getItem(
      LocalStorageEnum.keys.USER
    );

    if (item) {
      return JSON.parse(item) as IUser;
    }

    return null;
  };
}
