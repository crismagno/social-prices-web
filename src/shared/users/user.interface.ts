export default interface IUser {
  uid: string;
  name: string | null;
  email: string | null;
  token: string;
  providerId: string | null;
  imageUrl: string | null;
}
