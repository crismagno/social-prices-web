"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { IconUsers } from "../../components/common/icons/icons";
import Loading from "../../components/common/Loading/Loading";
import { Logo1 } from "../../components/common/Logo/Logo1";
import useAuthData from "../../data/context/auth/useAuthData";
import useLanguageData from "../../data/context/language/useLanguageData";
import useForceRedirect from "../../hooks/useForceRedirect/useForceRedirect";
import LoginEnum from "../../shared/common/enums/login.enum";
import Urls from "../../shared/common/routes-app/routes-app";

export default function LoginPage() {
  useForceRedirect();

  const { loginGoogle, login, create, isLoading } = useAuthData();

  const { t } = useLanguageData();

  const router = useRouter();

  const [mode, setMode] = useState<LoginEnum.Mode>(LoginEnum.Mode.LOGIN);

  const [emailOrUsername, setEmailOrUsername] = useState<string>();

  const [password, setPassword] = useState<string>();

  const [confirmPassword, setConfirmPassword] = useState<string>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const userInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);

  useEffect(() => {
    userInputRef.current?.focus();
  }, [mode]);

  const handleLoginOrCreate = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!emailOrUsername || !password) {
        userInputRef?.current?.focus();
        throw new Error(t("auth.pleaseEnterCredentials"));
      }

      if (mode === LoginEnum.Mode.CREATE && password !== confirmPassword) {
        passwordInputRef?.current?.focus();
        throw new Error(t("auth.pleaseCheckConfirmPassword"));
      }

      if (mode === LoginEnum.Mode.CREATE) {
        await create(emailOrUsername, password);
        return;
      }

      await login(emailOrUsername, password);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLoginGoogle = async () => {
    try {
      setIsSubmitting(true);

      await loginGoogle();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-row h-screen">
      <div className="hidden md:block md:w-2-1/2 lg:w-2/3">
        <Image
          src="/assets/images-random/social-prices-logo-test.webp"
          alt="Images on side"
          width={1000}
          height={1000}
          className="h-screen w-full object-cover"
        />
      </div>

      {(isSubmitting || isLoading) && (
        <div className="h-full w-full absolute flex justify-center items-center bg-gray-500/30 top-0 z-50">
          <Loading />
        </div>
      )}

      <form
        onSubmit={handleLoginOrCreate}
        className="relative flex flex-col justify-center m-10 w-full md:w-1/2 lg:w-1/3"
      >
        <div className="w-full flex justify-center">
          <Logo1 />
        </div>

        <h1 className="text-xl font-bold text-center">
          {mode === LoginEnum.Mode.LOGIN
            ? t("auth.enterWithYourAccount")
            : t("auth.createNewAccount")}
        </h1>

        <AuthInput
          ref={userInputRef}
          value={emailOrUsername}
          onChange={setEmailOrUsername}
          label={t("auth.user")}
          type="text"
          placeholder={
            mode === LoginEnum.Mode.LOGIN
              ? t("auth.typeEmailOrUsername")
              : t("auth.typeEmail")
          }
        />

        <AuthInput
          ref={passwordInputRef}
          value={password}
          onChange={setPassword}
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.typeYourPassword")}
          useShowPassword
        />

        {mode === LoginEnum.Mode.CREATE && (
          <AuthInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            label={t("auth.confirmPassword")}
            type="password"
            placeholder={t("auth.typeConfirmYourPassword")}
            useShowPassword
          />
        )}

        <a
          className="text-slate-500 hover:text-slate-800 text-sm cursor-pointer text-end mt-2 mr-2"
          onClick={() => router.push(Urls.RECOVER_PASSWORD)}
        >
          {t("auth.recoverPassword")}
        </a>

        <button
          className="mt-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-3 px-4"
          onClick={handleLoginOrCreate}
        >
          {mode === LoginEnum.Mode.LOGIN ? t("auth.login") : t("common.create")}
        </button>

        <hr className="border-gray-300 my-6 w-full" />

        <button
          type="button"
          onClick={submitLoginGoogle}
          className="bg-red-400 hover:bg-red-400 text-white rounded-lg py-1 px-4
           flex justify-center items-center"
        >
          <Image
            src={"/assets/images/google-logo.png"}
            alt="loading"
            width={40}
            height={40}
            className="mr-1"
          />
          {t("auth.enterWithGoogle")}
        </button>

        <button
          type="button"
          onClick={() => router.push(Urls.LOGIN_EMPLOYEE)}
          className="bg-green-500 hover:bg-green-400 text-white rounded-lg py-3 px-4 mt-4
           flex justify-center items-center"
        >
          {IconUsers("mr-3")}
          {t("auth.enterAsEmployee")}
        </button>

        <p className="mt-8">
          {mode === LoginEnum.Mode.LOGIN
            ? t("auth.dontHaveAccount")
            : t("auth.haveAccountAlready")}
          <a
            className="text-blue-500 hover:text-blue-600 font-semibold cursor-pointer ml-2"
            onClick={() =>
              setMode(
                mode === LoginEnum.Mode.LOGIN
                  ? LoginEnum.Mode.CREATE
                  : LoginEnum.Mode.LOGIN,
              )
            }
          >
            {mode === LoginEnum.Mode.LOGIN
              ? t("auth.createYourCredentials")
              : t("auth.enterWithMyCredentials")}
          </a>
        </p>
      </form>
    </div>
  );
}
