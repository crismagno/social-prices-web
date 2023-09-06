import { createContext, useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import firebaseApp from "../../services/firebase/config";
import IUser from "../../shared/business/users/user.interface";
import CookiesName from "../../shared/common/cookies/cookies";
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
  const token: string = await userFirebase.getIdToken();
  return {
    uid: userFirebase.uid,
    token,
    name: userFirebase.displayName ?? null,
    email: userFirebase.email ?? null,
    imageUrl: userFirebase.photoURL,
    providerId: userFirebase.providerId,
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

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const settingSession = async (userFirebase: User | null) => {
    if (userFirebase?.email) {
      const userNormalized = await normalizeUser(userFirebase);
      setUser(userNormalized);
      managerCookie(true);
      setIsLoading(false);
      return userNormalized.email;
    }

    setUser(null);
    managerCookie(false);
    setIsLoading(false);
    return null;
  };

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithPopup(auth, googleProvider);

      await settingSession(response.user);

      router.push(Urls.DASHBOARD);
    } catch (error: any) {
      throw "Error occur when attempt login with google.";
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );

      await settingSession(response.user);

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

      const response = await createUserWithEmailAndPassword(
        auth,
        username,
        password
      );

      await settingSession(response.user);

      router.push(Urls.DASHBOARD);
    } catch (error: any) {
      throw "Error occur when attempt create.";
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);

      await settingSession(null);

      router.push(Urls.LOGIN);
    } catch (error: any) {
      throw "Error occur when attempt logout with google.";
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Cookies.get(CookiesName.COOKIE_AUTH)) {
      const cancel = auth.onIdTokenChanged(settingSession);

      return () => cancel();
    } else {
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
