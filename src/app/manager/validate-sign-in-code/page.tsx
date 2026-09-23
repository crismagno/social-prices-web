"use client";

import { useEffect, useRef, useState } from "react";

import { App } from "antd";
import { useRouter } from "next/navigation";

import ButtonCommon from "../../../components/common/ButtonCommon/ButtonCommon";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import HrCustom from "../../../components/common/HrCustom/HrCustom";
import { Logo1 } from "../../../components/common/Logo/Logo1";
import useLanguageData from "../../../data/context/language/useLanguageData";
import useManagerAuthData from "../../../data/context/managerAuth/useManagerAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";

export default function ManagerValidateSignInCodePage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { manager, authToken, validateSignInCode } = useManagerAuthData();

  const router = useRouter();

  const [codeValue, setCodeValue] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const inputRef = useRef<any>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!authToken) {
      router.push(Urls.MANAGER_LOGIN);
    }
  }, [authToken, router]);

  const handleValidateSignInCode = async (event: any) => {
    event?.preventDefault();

    try {
      setIsSubmitting(true);

      if (!codeValue.trim()) {
        setCodeValue("");

        message.warning(t("manager.pleaseFillCodeValue"));

        return;
      }

      const isValid: boolean = await validateSignInCode(codeValue);

      if (!isValid) {
        message.error(t("manager.codeInvalid"));
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  return (
    <form
      onSubmit={handleValidateSignInCode}
      className="h-screen w-screen flex flex-col justify-center items-center
        bg-gradient-to-r from-slate-200 to-blue-100"
    >
      <div className="flex flex-col items-center w-11/12 md:w-1/2 lg:w-1/3 p-8 bg-white rounded-lg shadow-2xl">
        <Logo1 size={80} />

        <span className="text-xs text-center mt-1">{manager?.name}</span>

        <span className="text-xs text-center mt-1">{manager?.email}</span>

        <span className="text-lg text-center mt-4">
          {t("manager.signInCode")}
        </span>

        <input
          ref={inputRef}
          value={codeValue}
          onChange={(e) => setCodeValue(e.target.value)}
          placeholder={t("manager.typeYourCodeHere")}
          className="px-4 py-3 bg-gray-100 rounded-lg mt-8 w-full
            focus:bg-white focus:border-blue-100
            transition-all text-lg text-center"
          disabled={isSubmitting}
        />

        <ButtonCommon
          color="success"
          className="justify-center items-center py-2 rounded-md mt-5 w-full"
          onClick={handleValidateSignInCode}
          disabled={isSubmitting}
          loading={{ isLoading: isSubmitting, height: 30, width: 30 }}
        >
          {t("manager.send")}
        </ButtonCommon>

        <HrCustom className="my-6" />

        <ButtonCommon
          color="success"
          className="text-sm rounded-2xl px-4"
          onClick={() => router.push(Urls.MANAGER_LOGIN)}
          type="button"
          disabled={isSubmitting}
        >
          {t("manager.backToSignIn")}
        </ButtonCommon>
      </div>
    </form>
  );
}
