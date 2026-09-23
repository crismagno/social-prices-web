"use client";

import { useEffect, useRef, useState } from "react";

import { App } from "antd";
import { useRouter } from "next/navigation";

import AuthInput from "../../../components/common/AuthInput/AuthInput";
import ButtonCommon from "../../../components/common/ButtonCommon/ButtonCommon";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { Logo1 } from "../../../components/common/Logo/Logo1";
import useLanguageData from "../../../data/context/language/useLanguageData";
import useManagerAuthData from "../../../data/context/managerAuth/useManagerAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";

export default function ManagerLoginPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { login, isLogged, isLoading } = useManagerAuthData();

  const router = useRouter();

  const [email, setEmail] = useState<string>("");

  const [password, setPassword] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const emailInputRef = useRef<any>(null);

  useEffect(() => {
    emailInputRef?.current?.focus();
  }, []);

  // A manager with a redeemed session has no business on the sign in page.
  // Gate on isLogged, not on `manager`: between the password step and the
  // emailed code the manager is set but the session is not, and that person
  // must still be able to come back here.
  useEffect(() => {
    if (!isLoading && isLogged) {
      router.push(Urls.MANAGER_MANAGERS);
    }
  }, [isLoading, isLogged, router]);

  const handleLogin = async (event: any) => {
    event?.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim()) {
        message.warning(t("manager.pleaseFillEmail"));

        return;
      }

      if (!password.trim()) {
        message.warning(t("manager.pleaseFillPassword"));

        return;
      }

      await login(email, password);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingFull />;
  }

  if (isLogged) {
    return null;
  }

  return (
    <form
      onSubmit={handleLogin}
      className="h-screen w-screen flex flex-col justify-center items-center
        bg-gradient-to-r from-slate-200 to-blue-100"
    >
      <div className="flex flex-col w-11/12 md:w-1/2 lg:w-1/3 p-8 bg-white rounded-lg shadow-2xl">
        <div className="w-full flex justify-center">
          <Logo1 />
        </div>

        <h1 className="text-xl font-bold text-center mt-2">
          {t("manager.signIn")}
        </h1>

        <AuthInput
          ref={emailInputRef}
          value={email}
          onChange={setEmail}
          label={t("manager.email")}
          type="email"
          placeholder={t("manager.typeYourEmail")}
        />

        <AuthInput
          value={password}
          onChange={setPassword}
          label={t("manager.password")}
          type="password"
          placeholder={t("manager.typeYourPassword")}
          useShowPassword
        />

        <ButtonCommon
          color="success"
          className="justify-center items-center py-2 rounded-md mt-6 w-full"
          onClick={handleLogin}
          disabled={isSubmitting}
          loading={{ isLoading: isSubmitting, height: 30, width: 30 }}
        >
          {t("manager.login")}
        </ButtonCommon>

        <a
          className="text-blue-500 hover:text-blue-600 text-sm cursor-pointer mt-6 text-center"
          onClick={() => router.push(Urls.MANAGER_RECOVER_PASSWORD)}
        >
          {t("manager.forgotPassword")}
        </a>
      </div>
    </form>
  );
}
