"use client";

import { createContext, useCallback, useEffect, useState } from "react";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import firebaseApp from "../../services/firebase/config";
import { authServiceMethodsInstance } from "../../services/social-prices-api/auth/auth-service.methods";
import { usersServiceMethodsInstance } from "../../services/social-prices-api/users/user-service.methods";
import IUser from "../../shared/business/users/user.interface";
import UsersEnum from "../../shared/business/users/users.enum";
import CookiesEnum from "../../shared/common/cookies/cookies.enum";
import LocalStorageEnum from "../../shared/common/local-storage/local-storage.enum";
import LocalStorageUserMethods from "../../shared/common/local-storage/methods/local-storage-user.methods";
import Urls from "../../shared/common/routes-app/routes-app";

const googleProvider = new GoogleAuthProvider();
const auth = getAuth(firebaseApp);

export interface IAuthContext {
  user: IUser | null;
  isLoading: boolean;
  loginGoogle: () => Promise<void>;
  validateSignInCode: (codeValue: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<void>;
  create: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: IUser | null) => void;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoading: true,
  validateSignInCode: async (codeValue: string): Promise<any> => {},
  setUser: (user: IUser | null): void => {},
  loginGoogle: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  login: async (): Promise<void> => {},
  create: async (): Promise<void> => {},
});

const normalizeUser = async (userFirebase: User): Promise<IUser> => {
  const providerToken: string = await userFirebase.getIdToken();

  return {
    uid: userFirebase.uid,
    providerToken,
    username: userFirebase.displayName ?? null,
    email: userFirebase.email ?? null,
    avatar: userFirebase.photoURL,
    providerId: userFirebase.providerId,
    authProvider: UsersEnum.Provider.GOOGLE,
    authToken: null,
    extraDataProvider: null,
    phoneNumbers: userFirebase.phoneNumber
      ? [{ type: UsersEnum.PhoneTypes.OTHER, number: userFirebase.phoneNumber }]
      : null,
    status: null,
    addresses: [],
    birthDate: null,
    firstName: userFirebase.displayName,
    lastName: null,
    middleName: null,
    gender: null,
  };
};

const managerCookie = (isLogged: boolean) => {
  if (isLogged) {
    Cookies.set(CookiesEnum.CookiesName.COOKIE_AUTH, `${isLogged}`, {
      expires: 30,
    });
  } else {
    Cookies.remove(CookiesEnum.CookiesName.COOKIE_AUTH);
  }
};

const managerLocalStorage = (user: IUser | null) => {
  if (user) {
    localStorage.setItem(LocalStorageEnum.keys.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(LocalStorageEnum.keys.USER);
  }
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const settingSession = (user: IUser | null) => {
    if (user?.email) {
      setUser(user);
      managerCookie(true);
      managerLocalStorage(user);
      setIsLoading(false);
      return user.email;
    }

    setUser(null);
    managerCookie(false);
    managerLocalStorage(null);
    setIsLoading(false);
    return null;
  };

  const validateToken = async (userParam: IUser): Promise<IUser | null> => {
    try {
      setIsLoading(true);

      if (!userParam.authToken) {
        settingSession(null);
        return null;
      }

      const isValidToken: boolean =
        await authServiceMethodsInstance.validateToken(userParam.authToken);

      if (isValidToken) {
        settingSession(userParam);
        return userParam;
      }

      settingSession(null);

      if (userParam?.authProvider === UsersEnum.Provider.GOOGLE) {
        await signOut(auth);
      }

      router.push(Urls.LOGIN);
      return null;
    } catch (error: any) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const settingSessionFirebase = async (userFirebase: User | null) => {
    const userFromLocalStorage: IUser | null =
      LocalStorageUserMethods.getUser();

    if (userFirebase?.email && userFromLocalStorage) {
      const userNormalized: IUser = await normalizeUser(userFirebase);

      userFromLocalStorage.providerId = userNormalized.providerId;
      userFromLocalStorage.providerToken = userNormalized.providerToken;

      return (await validateToken(userFromLocalStorage))?.email;
    }

    settingSession(null);
    return null;
  };

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithPopup(auth, googleProvider);

      createOrSignInUserByLoginGoogle(response.user);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error("Error occur when attempt login with google.");
    }
  };

  const createOrSignInUserByLoginGoogle = (userFirebase: User) => {
    setTimeout(async () => {
      const userNormalized: IUser = await normalizeUser(userFirebase);

      const responseUser: IUser = await authServiceMethodsInstance.signUp({
        email: `${userNormalized.email}`,
        password: `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_SIGN_UP_PASSWORD_TEMP}`,
        username: `${userNormalized.username}`,
        authProvider: userNormalized.authProvider,
        avatar: userNormalized.avatar ?? undefined,
        extraDataProvider: userNormalized.extraDataProvider,
        phoneNumbers: userNormalized.phoneNumbers ?? [],
        uid: userNormalized.uid,
      });

      responseUser.providerId = userNormalized.providerId;
      responseUser.providerToken = userNormalized.providerToken;

      setUser(responseUser);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);

      setIsLoading(false);
    }, 3000);
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IUser = await authServiceMethodsInstance.signIn(
        username,
        password
      );

      setUser(response);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);
    } catch (error: any) {
      const messageError: string = handleClientError(error);
      throw new Error(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IUser = await authServiceMethodsInstance.signUp({
        email: username,
        password,
        username,
      });

      setUser(response);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);
    } catch (error: any) {
      const messageError: string = handleClientError(error);
      throw new Error(messageError);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      if (user?.authProvider === UsersEnum.Provider.GOOGLE) {
        await signOut(auth);
      }

      settingSession(null);

      router.push(Urls.LOGIN);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignInCode = async (codeValue: string): Promise<boolean> => {
    try {
      if (!user) {
        router.push(Urls.LOGIN);
        return false;
      }

      setIsLoading(true);

      const isValidateSignInCode: boolean =
        await authServiceMethodsInstance.validateSignInCode(
          user.authToken!,
          codeValue
        );

      if (!isValidateSignInCode) {
        return false;
      }

      const responseUser: IUser =
        await usersServiceMethodsInstance.getUserByToken(user.authToken!);

      settingSession({ ...user, ...responseUser });

      router.push(Urls.DASHBOARD);
      return true;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const componentWillMount = useCallback(async () => {
    if (Cookies.get(CookiesEnum.CookiesName.COOKIE_AUTH)) {
      const userFromLocalStorage: IUser | null =
        LocalStorageUserMethods.getUser();

      if (!userFromLocalStorage) {
        settingSession(null);
        return;
      }

      if (
        userFromLocalStorage?.authProvider === UsersEnum.Provider.SOCIAL_PRICES
      ) {
        await validateToken(userFromLocalStorage);
      } else {
        const cancel = auth.onIdTokenChanged(settingSessionFirebase);

        return () => cancel();
      }
    } else {
      settingSession(null);
    }
  }, []);

  useEffect(() => {
    componentWillMount();
  }, [componentWillMount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginGoogle,
        isLoading,
        logout,
        login,
        create,
        validateSignInCode,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
