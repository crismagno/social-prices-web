"use client";

import { useState } from "react";

import { message } from "antd";
import { useRouter } from "next/navigation";

import Avatar from "../../components/common/Avatar/Avatar";
import ButtonCommon from "../../components/common/ButtonCommon/ButtonCommon";
import handleClientError from "../../components/common/handleClientError/handleClientError";
import HrCustom from "../../components/common/HrCustom/HrCustom";
import useAuthData from "../../data/context/auth/useAuthData";
import useForceRedirect from "../../hooks/useForceRedirect/useForceRedirect";
import Urls from "../../shared/common/routes-app/routes-app";

export default function ValidateSignInCodePage() {
  useForceRedirect();

  const { user, validateSignInCode, setUser } = useAuthData();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [codeValue, setCodeValue] = useState<string>("");

  const handleValidateSignInCode = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      if (!codeValue.trim()) {
        setCodeValue("");

        message.warning("Please fill code value!");

        return;
      }

      const isCodeValueValid: boolean = await validateSignInCode(codeValue);

      if (!isCodeValueValid) {
        message.error("Code invalid");
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleValidateSignInCode}
      className="h-screen w-screen flex flex-col justify-center items-center 
        bg-gradient-to-r from-green-100 to-slate-200"
    >
      <div className="flex flex-col justify-center items-center lg:w-1/4 md:w-1/2">
        <div
          className="flex flex-col justify-center items-center w-full h-full
          p-3 shadow-2xl bg-white rounded-lg"
        >
          <Avatar src={user?.avatar} alt="Image logo" width={100} />

          <span className="text-xs text-center mt-1">
            {user?.email ?? "---"}
          </span>

          <span className="text-lg text-center mt-4">Sign In Code</span>

          <input
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value)}
            placeholder="Type your code here..."
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
            loading={{
              isLoading: isSubmitting,
              height: 30,
              width: 30,
            }}
          >
            Send
          </ButtonCommon>
        </div>

        <HrCustom className="my-6" />

        <ButtonCommon
          color="success"
          className="text-sm rounded-2xl px-4"
          onClick={() => {
            setUser(null);
            router.push(Urls.LOGIN);
          }}
          type="button"
          disabled={isSubmitting}
        >
          Go to login
        </ButtonCommon>
      </div>
    </form>
  );
}
