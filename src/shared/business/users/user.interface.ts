import UsersEnum from "./users.enum";

export default interface IUser {
  uid: string;
  username: string | null;
  email: string | null;
  providerToken: string;
  providerId: string | null;
  authToken: string | null;
  avatar: string | null;
  authProvider: UsersEnum.Provider;
  phoneNumbers: string[] | null;
  status: UsersEnum.Status | null;
  extraDataProvider: any | null;
}
