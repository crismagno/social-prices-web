import axios from 'axios';

import IUser from '../../../shared/business/users/user.interface';
import AuthServiceEnum from './auth-service.enum';

export default class AuthServiceMethods {
  private readonly _socialPricesApiV1: string = `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1}`;

  public async signIn(email: string, password: string): Promise<IUser> {
    const response = await axios.post(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_IN}`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }

  public async signUp(params: any): Promise<IUser> {
    const response = await axios.post(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_UP}`,
      params,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }
}
