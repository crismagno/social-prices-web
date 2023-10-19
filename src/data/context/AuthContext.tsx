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
  updateUserSession: (newUser: IUser | null) => void;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoading: true,
  validateSignInCode: async (codeValue: string): Promise<any> => {},
  setUser: (user: IUser | null): void => {},
  updateUserSession: (newUser: IUser | null): void => {},
  loginGoogle: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  login: async (): Promise<void> => {},
  create: async (): Promise<void> => {},
});

const __normalizeUser = async (userFirebase: User): Promise<IUser> => {
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
      ? [
          {
            type: UsersEnum.PhoneTypes.OTHER,
            number: userFirebase.phoneNumber,
            uid: Date.now().toString(),
          },
        ]
      : null,
    status: null,
    addresses: [],
    birthDate: null,
    firstName: userFirebase.displayName,
    lastName: null,
    middleName: null,
    gender: null,
    loggedByAuthProvider: UsersEnum.Provider.GOOGLE,
  };
};

const __managerCookie = (isLogged: boolean) => {
  if (isLogged) {
    Cookies.set(CookiesEnum.CookiesName.COOKIE_AUTH, `${isLogged}`, {
      expires: 30,
    });
  } else {
    Cookies.remove(CookiesEnum.CookiesName.COOKIE_AUTH);
  }
};

const __managerLocalStorage = (user: IUser | null) => {
  if (user) {
    localStorage.setItem(LocalStorageEnum.keys.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(LocalStorageEnum.keys.USER);
  }
};

const __getUserUpdated = (currentUser: IUser, newUser: IUser): IUser => {
  return {
    ...newUser,
    providerId: currentUser.providerId,
    providerToken: currentUser.providerToken,
    loggedByAuthProvider: currentUser.loggedByAuthProvider,
    authToken: currentUser.authToken,
  };
};

export const AuthProvider = ({ children }: { children?: any }) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const _settingSession = (user: IUser | null) => {
    if (user?.email) {
      setUser(user);
      __managerCookie(true);
      __managerLocalStorage(user);
      setIsLoading(false);
      return user.email;
    }

    setUser(null);
    __managerCookie(false);
    __managerLocalStorage(null);
    setIsLoading(false);
    return null;
  };

  const _validateToken = async (userParam: IUser): Promise<IUser | null> => {
    try {
      setIsLoading(true);

      if (!userParam.authToken) {
        _settingSession(null);
        return null;
      }

      const isValidToken: boolean =
        await authServiceMethodsInstance.validateToken(userParam.authToken);

      if (isValidToken) {
        const userResponse: IUser = await usersServiceMethodsInstance.getUser();

        const newUser: IUser = __getUserUpdated(userParam, userResponse);

        _settingSession(newUser);
        return newUser;
      }

      _settingSession(null);

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

  const _settingSessionFirebase = async (userFirebase: User | null) => {
    const userFromLocalStorage: IUser | null =
      LocalStorageUserMethods.getUser();

    if (userFirebase?.email && userFromLocalStorage) {
      const userNormalized: IUser = await __normalizeUser(userFirebase);

      userFromLocalStorage.providerId = userNormalized.providerId;
      userFromLocalStorage.providerToken = userNormalized.providerToken;

      const userValidateToken: IUser | null = await _validateToken(
        userFromLocalStorage
      );

      return userValidateToken?.email;
    }

    _settingSession(null);
    return null;
  };

  const _createOrSignInUserByLoginGoogle = (userFirebase: User) => {
    setTimeout(async () => {
      const userNormalized: IUser = await __normalizeUser(userFirebase);

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
      responseUser.loggedByAuthProvider = UsersEnum.Provider.GOOGLE;

      setUser(responseUser);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);

      setIsLoading(false);
    }, 3000);
  };

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithPopup(auth, googleProvider);

      _createOrSignInUserByLoginGoogle(response.user);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error("Error occur when attempt login with google.");
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IUser = await authServiceMethodsInstance.signIn(
        username,
        password
      );

      response.loggedByAuthProvider = UsersEnum.Provider.SOCIAL_PRICES;

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

      response.loggedByAuthProvider = UsersEnum.Provider.SOCIAL_PRICES;

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

      if (user?.loggedByAuthProvider === UsersEnum.Provider.GOOGLE) {
        await signOut(auth);
      }

      _settingSession(null);

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

      const userResponse: IUser =
        await usersServiceMethodsInstance.getUserByToken(user.authToken!);

      const newUser: IUser = __getUserUpdated(user, userResponse);

      _settingSession(newUser);

      router.push(Urls.DASHBOARD);
      return true;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSession = (userUpdated: IUser | null): void => {
    if (!userUpdated) {
      return;
    }

    if (!user) {
      _settingSession(null);
      return;
    }

    const newUser: IUser = __getUserUpdated(user, userUpdated);

    _settingSession(newUser);
  };

  /**
   * Method main to mount app data
   */
  const _componentWillMount = useCallback(async () => {
    const hasNoCookieAuth: boolean = !Cookies.get(
      CookiesEnum.CookiesName.COOKIE_AUTH
    );

    if (hasNoCookieAuth) {
      _settingSession(null);
      return;
    }

    const userFromLocalStorage: IUser | null =
      LocalStorageUserMethods.getUser();

    if (!userFromLocalStorage) {
      _settingSession(null);
      return;
    }

    if (
      userFromLocalStorage?.loggedByAuthProvider === UsersEnum.Provider.GOOGLE
    ) {
      const cancel = auth.onIdTokenChanged(_settingSessionFirebase);

      return () => cancel();
    }

    await _validateToken(userFromLocalStorage);
  }, []);

  useEffect(() => {
    _componentWillMount();
  }, [_componentWillMount]);

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
        updateUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
