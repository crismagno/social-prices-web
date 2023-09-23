"use client";

import { createContext, useEffect, useState } from "react";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import firebaseApp from "../../services/firebase/config";
import { authServiceMethodsInstance } from "../../services/social-prices-api/auth/auth-service.methods";
import IUser from "../../shared/business/users/user.interface";
import UsersEnum from "../../shared/business/users/users.enum";
import CookiesName from "../../shared/common/cookies/cookies";
import LocalStorageEnum from "../../shared/common/local-storage/local-storage.enum";
import Urls from "../../shared/common/routes-app/routes-app";

const googleProvider = new GoogleAuthProvider();
const auth = getAuth(firebaseApp);

export interface IAuthContext {
  user: IUser | null;
  isLoading: boolean;
  loginGoogle: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  create: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoading: true,
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
    phoneNumbers: userFirebase.phoneNumber ? [userFirebase.phoneNumber] : null,
    status: null,
  };
};

const managerCookie = (isLogged: boolean) => {
  if (isLogged) {
    Cookies.set(CookiesName.COOKIE_AUTH, `${isLogged}`, {
      expires: 30,
    });
  } else {
    Cookies.remove(CookiesName.COOKIE_AUTH);
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

  const settingSessionFirebase = async (userFirebase: User | null) => {
    const userFromLocalStorage: IUser | null = getUserFromLocalStorage();

    if (userFirebase?.email && userFromLocalStorage) {
      const userNormalized: IUser = await normalizeUser(userFirebase);

      userFromLocalStorage.providerId = userNormalized.providerId;
      userFromLocalStorage.providerToken = userNormalized.providerToken;

      return await validateToken(userFromLocalStorage);
    }

    settingSession(null);
    return null;
  };

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

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithPopup(auth, googleProvider);

      createOrSignInUserByLoginGoogle(response.user);
    } catch (error: any) {
      throw new Error("Error occur when attempt login with google.");
    } finally {
      setIsLoading(false);
    }
  };

  const createOrSignInUserByLoginGoogle = (userFirebase: User) => {
    setTimeout(async () => {
      const userNormalized: IUser = await normalizeUser(userFirebase);

      const responseUser: IUser = await authServiceMethodsInstance.signUp({
        email: `${userNormalized.email}`,
        password: "123456",
        username: `${userNormalized.username}`,
        authProvider: userNormalized.authProvider,
        avatar: userNormalized.avatar ?? undefined,
        extraDataProvider: userNormalized.extraDataProvider,
        phoneNumbers: userNormalized.phoneNumbers ?? [],
        uid: userNormalized.uid,
      });

      responseUser.providerId = userNormalized.providerId;
      responseUser.providerToken = userNormalized.providerToken;

      settingSession(responseUser);

      router.push(Urls.DASHBOARD);
    }, 1000);
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IUser = await authServiceMethodsInstance.signIn(
        username,
        password
      );

      settingSession(response);

      router.push(Urls.DASHBOARD);
    } catch (error: any) {
      throw error;
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

      settingSession(response);

      router.push(Urls.DASHBOARD);
    } catch (error: any) {
      throw error;
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

  const getUserFromLocalStorage = (): IUser | null => {
    const item: string | null = localStorage.getItem(
      LocalStorageEnum.keys.USER
    );

    if (item) {
      return JSON.parse(item) as IUser;
    }
    return null;
  };

  const validateToken = async (userParam: IUser): Promise<IUser | null> => {
    try {
      setIsLoading(true);

      const isValidToken: boolean =
        await authServiceMethodsInstance.validateToken(userParam.authToken!);

      if (!isValidToken) {
        settingSession(null);

        if (userParam?.authProvider === UsersEnum.Provider.GOOGLE) {
          await signOut(auth);
        }

        router.push(Urls.LOGIN);
        return null;
      }

      settingSession(userParam);
      return userParam;
    } catch (error: any) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Cookies.get(CookiesName.COOKIE_AUTH)) {
      const userFromLocalStorage: IUser | null = getUserFromLocalStorage();

      if (!userFromLocalStorage) {
        settingSession(null);
        return;
      }

      if (
        userFromLocalStorage?.authProvider === UsersEnum.Provider.SOCIAL_PRICES
      ) {
        validateToken(userFromLocalStorage);
      } else {
        const cancel = auth.onIdTokenChanged(settingSessionFirebase);

        return () => cancel();
      }
    } else {
      settingSession(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loginGoogle, isLoading, logout, login, create }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
