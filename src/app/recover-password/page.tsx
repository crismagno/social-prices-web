"use client";

import { useState } from "react";

import { message } from "antd";
import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import Avatar from "../../components/common/Avatar/Avatar";
import ButtonCommon from "../../components/common/ButtonCommon/ButtonCommon";
import HrCustom from "../../components/common/HrCustom/HrCustom";
import Loading from "../../components/common/Loading/Loading";
import { Logo1 } from "../../components/common/Logo/Logo1";
import useAuthData from "../../data/context/auth/useAuthData";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";

export default function RecoverPasswordPage() {
  const { user } = useAuthData();

  const { t } = useLanguageData();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isSentRecoverPassword, setIsSentRecoverPassword] =
    useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");

  const [codeValue, setCodeValue] = useState<string>("");

  const handleSendRecoverPasswordCode = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim()) {
        setCodeValue("");
        message.warning(t("auth.pleaseFillEmail"));
        return;
      }

      await serviceMethodsInstance.usersServiceMethods.sendRecoverPasswordCode(
        email
      );

      setIsSentRecoverPassword(true);

      message.success(t("auth.codeToRecoverPasswordSent"));
    } catch (error: any) {
      message.error(t("auth.errorSendRecoverPasswordCode"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverPassword = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim() || !codeValue.trim() || !newPassword.trim()) {
        message.warning(t("auth.pleaseFillInputValues"));
        return;
      }

      await serviceMethodsInstance.usersServiceMethods.recoverPassword({
        codeValue,
        email,
        newPassword,
      });

      message.success(t("auth.passwordHasBeenReset"));

      router.back();
    } catch (error: any) {
      message.error(t("auth.errorRecoverPassword"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col justify-between items-center 
        bg-gradient-to-r from-blue-100 to-slate-200"
    >
      <div />

      <div className="flex flex-col justify-center items-center lg:w-1/4 md:w-1/2">
        <div
          className="flex flex-col justify-center items-center 
          w-full h-full p-3 shadow-2xl bg-white rounded-lg"
        >
          <span className="text-lg text-center mt-6 mb-4">
            {t("auth.recoverPassword")}
          </span>

          <Avatar src={user?.avatar} alt="Image logo" width={100} />

          <form onSubmit={handleSendRecoverPasswordCode} className="w-full">
            <AuthInput
              value={email}
              onChange={setEmail}
              placeholder={t("auth.typeYourEmail")}
              disabled={isSubmitting}
              label={t("common.email")}
              divClassName="w-full"
            />

            <button
              className="px-4 py-2 mt-1 text-blue-600 w-full text-sm "
              onClick={handleSendRecoverPasswordCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading height={30} width={30} />
              ) : (
                t("auth.sendRecoverPasswordCode")
              )}
            </button>
          </form>

          {isSentRecoverPassword && (
            <form onSubmit={handleRecoverPassword} className="w-full h-full">
              <HrCustom className="my-6" />

              <AuthInput
                value={codeValue}
                onChange={setCodeValue}
                placeholder={t("auth.typeCodeValue")}
                disabled={isSubmitting}
                label={t("auth.code")}
                divClassName="w-full"
              />

              <AuthInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder={t("auth.typeYourNewPassword")}
                disabled={isSubmitting}
                label={t("auth.newPassword")}
                divClassName="w-full"
                type="password"
                useShowPassword
              />

              <ButtonCommon
                className="justify-center items-center w-full mt-5 py-2"
                onClick={handleRecoverPassword}
                disabled={isSubmitting}
                color="primary"
                loading={{
                  isLoading: isSubmitting,
                  height: 30,
                  width: 30,
                }}
              >
                {t("auth.recover")}
              </ButtonCommon>
            </form>
          )}
        </div>

        <HrCustom />

        <ButtonCommon
          className="text-sm rounded-2xl px-4"
          onClick={() => router.back()}
          disabled={isSubmitting}
          color="primary"
        >
          {t("common.goBack")}
        </ButtonCommon>
      </div>

      <footer>
        <Logo1 size={50} />
      </footer>
    </div>
  );
}
