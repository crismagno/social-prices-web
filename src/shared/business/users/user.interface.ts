import UsersEnum from './users.enum';

export default interface IUser {
  uid: string;
  username: string | null;
  email: string | null;
  providerToken: string;
  authToken: string | null;
  providerId: string | null;
  avatar: string | null;
  authProvider: UsersEnum.Provider;
  extraDataProvider: any | null;
  phoneNumbers: string[] | null;
  status: UsersEnum.Status | null;
}
