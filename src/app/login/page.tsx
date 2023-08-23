"use client";

import { useEffect, useRef, useState } from "react";

import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";

import WormAlert, {
  IWormAlertRefProps,
  WormAlertTypeEnum,
} from "../../components/common/WorkAlert/WormAlert";
import AuthInput from "../../components/elements/AuthInput/AuthInput";
import { IconWarning } from "../../components/elements/icons/icons";
import useAuthData from "../../data/hook/useAuthData";
import CookiesName from "../../shared/common/cookies/cookies";
import Urls from "../../shared/common/routes/routes";
import LoginEnum from "../../shared/enums/login.enum";

export default function Login() {
  const { loginGoogle, login, create, user } = useAuthData();

  const router = useRouter();

  const [mode, setMode] = useState<LoginEnum.Mode>(LoginEnum.Mode.LOGIN);

  const [username, setUsername] = useState<string>();

  const [password, setPassword] = useState<string>();

  const [confirmPassword, setConfirmPassword] = useState<string>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const wormTextMessage: React.MutableRefObject<IWormAlertRefProps | null> =
    useRef(null);

  const submitLoginOrCreate = async () => {
    try {
      setIsSubmitting(true);

      if (!username || !password) {
        throw new Error("Please enter with your credentials!");
      }

      if (mode === LoginEnum.Mode.CREATE && password !== confirmPassword) {
        throw new Error("Please check confirm password!");
      }

      if (mode === LoginEnum.Mode.CREATE) {
        await create(username, password);
        return;
      }

      await login(username, password);
    } catch (error: any) {
      wormTextMessage.current?.showWormText(
        error.message,
        5,
        WormAlertTypeEnum.DANGER
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLoginGoogle = async () => {
    try {
      setIsSubmitting(true);

      await loginGoogle();
    } catch (error: any) {
      wormTextMessage.current?.showWormText(
        error.message,
        5,
        WormAlertTypeEnum.DANGER
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user || Cookies.get(CookiesName.COOKIE_AUTH)) {
      router.push(Urls.DASHBOARD);
    }
  }, [user, router]);

  return (
    <div className="flex flex-row h-screen">
      {/* part images left */}
      <div className="hidden md:block md:w-2-1/2 lg:w-2/3">
        <img
          src="https://source.unsplash.com/random"
          alt="Images on side"
          className="h-screen w-full object-cover"
        />
      </div>

      {/* part login and create  */}

      <div className="relative flex flex-col justify-center m-10 w-full md:w-1/2 lg:w-1/3">
        {isSubmitting && (
          <div className="h-full w-full absolute flex justify-center items-center bg-gray-500/10 top-0">
            <Image src={"/loading.gif"} alt="loading" width={50} height={50} />
          </div>
        )}
        <WormAlert
          ref={wormTextMessage}
          className="my-3"
          icon={IconWarning("text-large mr-2")}
        />
        <h1 className="text-xl font-bold text-center">
          {mode === LoginEnum.Mode.LOGIN
            ? "Enter with your account"
            : "Create a new account"}
        </h1>
        <AuthInput
          value={username}
          onChange={setUsername}
          label="User"
          type="text"
          placeholder="Type email or username"
        />
        <AuthInput
          value={password}
          onChange={setPassword}
          label="Password"
          type="password"
          placeholder="Type your password"
        />
        {mode === LoginEnum.Mode.CREATE && (
          <AuthInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            label="Confirm Password"
            type="password"
            placeholder="Type confirm your password"
          />
        )}
        <button
          className="mt-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-3 px-4"
          onClick={submitLoginOrCreate}
        >
          {mode === LoginEnum.Mode.LOGIN ? "Login" : "Create"}
        </button>
        <hr className="border-gray-300 my-6 w-full" />
        <button
          onClick={submitLoginGoogle}
          className="bg-red-500 hover:bg-red-400 text-white rounded-lg py-3 px-4"
        >
          Enter with Google
        </button>
        <p className="mt-8">
          {mode === LoginEnum.Mode.LOGIN
            ? "Don`t you have a account?"
            : "I have account already!"}
          <a
            className="text-blue-500 hover:text-blue-600 font-semibold cursor-pointer ml-2"
            onClick={() =>
              setMode(
                mode === LoginEnum.Mode.LOGIN
                  ? LoginEnum.Mode.CREATE
                  : LoginEnum.Mode.LOGIN
              )
            }
          >
            {mode === LoginEnum.Mode.LOGIN
              ? "Create your credentials"
              : "Enter with my credentials"}
          </a>
        </p>
      </div>
    </div>
  );
}
