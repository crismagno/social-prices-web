"use client";

import { useState } from "react";

import { message } from "antd";
import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import Avatar from "../../components/common/Avatar/Avatar";
import ButtonCommon from "../../components/common/ButtonCommon/ButtonCommon";
import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import HrCustom from "../../components/common/HrCustom/HrCustom";
import Loading from "../../components/common/Loading/Loading";
import { Logo1 } from "../../components/common/Logo/Logo1";
import useAuthData from "../../data/context/auth/useAuthData";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import IUser from "../../shared/business/users/user.interface";

export default function UpdateEmailPage() {
  const { updateUserSession, user } = useAuthData();

  const { t } = useLanguageData();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isSentUpdateEmail, setIsSentUpdateEmail] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const [newEmail, setNewEmail] = useState<string>("");

  const [codeValue, setCodeValue] = useState<string>("");

  const handleSendUpdateEmailCode = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim()) {
        setCodeValue("");
        message.warning(t("auth.pleaseFillEmail"));
        return;
      }

      await serviceMethodsInstance.usersServiceMethods.sendUpdateEmailCode(
        email
      );

      setIsSentUpdateEmail(true);

      message.success(t("auth.codeToUpdateEmailSent"));
    } catch (error: any) {
      message.error(t("auth.errorSendUpdateEmailCode"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmail = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim() || !codeValue.trim() || !newEmail.trim()) {
        message.warning(t("auth.pleaseFillInputValues"));
        return;
      }

      const newUser: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateEmail({
          codeValue,
          email,
          newEmail,
        });

      message.success(t("auth.emailHasBeenReset"));

      updateUserSession(newUser);

      router.back();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col justify-between items-center 
        bg-gradient-to-r from-teal-100 to-slate-200"
    >
      <div />

      <div className="flex flex-col justify-center items-center lg:w-1/4 md:w-1/2">
        <div
          className="flex flex-col justify-center items-center 
          w-full h-full p-3 shadow-2xl bg-white rounded-lg"
        >
          <span className="text-lg text-center mt-6 mb-4">{t("auth.updateEmail")}</span>
          <Avatar src={user?.avatar} alt="Image logo" width={100} />

          <form onSubmit={handleSendUpdateEmailCode} className="w-full">
            <AuthInput
              value={email}
              onChange={setEmail}
              placeholder={t("auth.typeYourEmail")}
              disabled={isSubmitting}
              label={t("common.email")}
              divClassName="w-full"
            />

            <button
              className="px-4 py-2 mt-1 text-teal-600 w-full text-sm "
              onClick={handleSendUpdateEmailCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading height={30} width={30} />
              ) : (
                t("auth.sendUpdateEmailCode")
              )}
            </button>
          </form>

          {isSentUpdateEmail && (
            <form onSubmit={handleUpdateEmail} className="w-full h-full">
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
                value={newEmail}
                onChange={setNewEmail}
                placeholder={t("auth.typeYourNewEmail")}
                disabled={isSubmitting}
                label={t("auth.newEmail")}
                divClassName="w-full"
              />

              <ButtonCommon
                className="justify-center items-center w-full mt-5 py-2"
                onClick={handleUpdateEmail}
                disabled={isSubmitting}
                color="success"
                loading={{
                  isLoading: isSubmitting,
                  height: 30,
                  width: 30,
                }}
              >
                {t("common.update")}
              </ButtonCommon>
            </form>
          )}
        </div>

        <HrCustom />

        <ButtonCommon
          className="text-sm rounded-2xl px-4"
          onClick={() => router.back()}
          disabled={isSubmitting}
          type="button"
          color="success"
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
