"use client";

import { useState } from "react";

import { App } from "antd";
import { useRouter } from "next/navigation";

import AuthInput from "../../../components/common/AuthInput/AuthInput";
import ButtonCommon from "../../../components/common/ButtonCommon/ButtonCommon";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import { Logo1 } from "../../../components/common/Logo/Logo1";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import Urls from "../../../shared/common/routes-app/routes-app";

export default function ManagerRecoverPasswordPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const [codeValue, setCodeValue] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");

  const handleSendCode = async (event: any) => {
    event?.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim()) {
        message.warning(t("manager.pleaseFillEmail"));

        return;
      }

      await serviceMethodsInstance.managerAuthServiceMethods.sendRecoverPasswordCode(
        email
      );

      setIsCodeSent(true);

      message.success(t("manager.codeToRecoverPasswordSent"));
    } catch (error: any) {
      message.error(t("manager.errorSendRecoverPasswordCode"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverPassword = async (event: any) => {
    event?.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim() || !codeValue.trim() || !newPassword.trim()) {
        message.warning(t("manager.pleaseFillInputValues"));

        return;
      }

      await serviceMethodsInstance.managerAuthServiceMethods.recoverPassword({
        email,
        codeValue,
        newPassword,
      });

      message.success(t("manager.passwordHasBeenReset"));

      router.push(Urls.MANAGER_LOGIN);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={isCodeSent ? handleRecoverPassword : handleSendCode}
      className="h-screen w-screen flex flex-col justify-center items-center
        bg-gradient-to-r from-slate-200 to-blue-100"
    >
      <div className="flex flex-col w-11/12 md:w-1/2 lg:w-1/3 p-8 bg-white rounded-lg shadow-2xl">
        <div className="w-full flex justify-center">
          <Logo1 />
        </div>

        <h1 className="text-xl font-bold text-center mt-2">
          {t("manager.recoverPassword")}
        </h1>

        <AuthInput
          value={email}
          onChange={setEmail}
          label={t("manager.email")}
          type="email"
          placeholder={t("manager.typeYourEmail")}
        />

        {isCodeSent && (
          <>
            <AuthInput
              value={codeValue}
              onChange={setCodeValue}
              label={t("manager.signInCode")}
              type="text"
              placeholder={t("manager.typeYourCodeHere")}
            />

            <AuthInput
              value={newPassword}
              onChange={setNewPassword}
              label={t("manager.newPassword")}
              type="password"
              placeholder={t("manager.typeYourPassword")}
              useShowPassword
            />
          </>
        )}

        <ButtonCommon
          color="success"
          className="justify-center items-center py-2 rounded-md mt-6 w-full"
          onClick={isCodeSent ? handleRecoverPassword : handleSendCode}
          disabled={isSubmitting}
          loading={{ isLoading: isSubmitting, height: 30, width: 30 }}
        >
          {isCodeSent ? t("manager.save") : t("manager.send")}
        </ButtonCommon>

        <HrCustom className="my-6" />

        <a
          className="text-blue-500 hover:text-blue-600 text-sm cursor-pointer text-center"
          onClick={() => router.push(Urls.MANAGER_LOGIN)}
        >
          {t("manager.backToSignIn")}
        </a>
      </div>
    </form>
  );
}
