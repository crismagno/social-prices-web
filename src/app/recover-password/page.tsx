"use client";

import { useEffect, useRef, useState } from "react";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import Loading from "../../components/common/Loading/Loading";
import WormAlert, {
  IWormAlertRefProps,
  WormAlertTypeEnum,
} from "../../components/common/WorkAlert/WormAlert";
import AuthInput from "../../components/elements/AuthInput/AuthInput";
import useAuthData from "../../data/hook/useAuthData";
import { usersServiceMethodsInstance } from "../../services/social-prices-api/users/user-service.methods";
import CookiesEnum from "../../shared/common/cookies/cookies.enum";
import Urls from "../../shared/common/routes-app/routes-app";

export default function RecoverPassword() {
  const { user } = useAuthData();

  const router = useRouter();

  useEffect(() => {
    if (user && Cookies.get(CookiesEnum.CookiesName.COOKIE_AUTH)) {
      router.push(Urls.DASHBOARD);
    }
  }, [user, router]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isSentRecoverPassword, setIsSentRecoverPassword] =
    useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");

  const [codeValue, setCodeValue] = useState<string>("");

  const wormTextMessage: React.MutableRefObject<IWormAlertRefProps | null> =
    useRef(null);

  const handleSendRecoverPasswordCode = async () => {
    try {
      setIsSubmitting(true);

      if (!email.trim()) {
        setCodeValue("");

        wormTextMessage.current?.showWormText(
          "Please fill email.",
          3,
          WormAlertTypeEnum.WARNING
        );

        return;
      }

      await usersServiceMethodsInstance.sendRecoverPasswordCode(email);

      setIsSentRecoverPassword(true);

      wormTextMessage.current?.showWormText(
        "Code to recover password was sent to your email.",
        3,
        WormAlertTypeEnum.SUCCESS
      );
    } catch (error: any) {
      wormTextMessage.current?.showWormText(
        "Error when attempt send recover password code.",
        3,
        WormAlertTypeEnum.DANGER
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverPassword = async () => {
    try {
      setIsSubmitting(true);

      if (!email.trim() || !codeValue.trim() || !newPassword.trim()) {
        wormTextMessage.current?.showWormText(
          "Please fill input values.",
          3,
          WormAlertTypeEnum.WARNING
        );

        return;
      }

      await usersServiceMethodsInstance.recoverPassword({
        codeValue,
        email,
        newPassword,
      });

      wormTextMessage.current?.showWormText(
        "Your password has been reset.",
        3,
        WormAlertTypeEnum.SUCCESS
      );

      router.push(Urls.LOGIN);
    } catch (error: any) {
      console.log(error);
      wormTextMessage.current?.showWormText(
        "Error when attempt recover password.",
        3,
        WormAlertTypeEnum.DANGER
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col justify-center items-center 
    bg-gradient-to-r from-blue-100 to-slate-200"
    >
      <div className="flex flex-col justify-center items-center lg:w-1/4 md:w-1/2">
        <WormAlert ref={wormTextMessage} className="my-3 w-full" />

        <div
          className="flex flex-col justify-center items-center w-full h-full p-8
          p-3 shadow-2xl bg-white rounded-lg"
        >
          <span className="text-lg text-center mt-6">Recover Password</span>

          <AuthInput
            value={email}
            onChange={setEmail}
            placeholder="Type your email"
            disabled={isSubmitting}
            label="Email"
            divClassName="w-full"
          />

          <button
            className="flex justify-center items-center px-4 py-2 rounded-md mt-1
           text-blue-600 w-full"
            onClick={handleSendRecoverPasswordCode}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loading height={30} width={30} />
            ) : (
              "Send recover password code"
            )}
          </button>

          {isSentRecoverPassword && (
            <AuthInput
              value={codeValue}
              onChange={setCodeValue}
              placeholder="Type code value"
              disabled={isSubmitting}
              label="Code"
              divClassName="w-full"
            />
          )}

          {isSentRecoverPassword && (
            <AuthInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Type your new password"
              disabled={isSubmitting}
              label="New Password"
              divClassName="w-full"
              type="password"
            />
          )}

          {isSentRecoverPassword && (
            <button
              className="flex justify-center items-center px-4 py-2 rounded-md mt-5
          bg-gradient-to-r from-blue-400 to-blue-600 text-white w-full"
              onClick={handleRecoverPassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loading height={30} width={30} /> : "Recover"}
            </button>
          )}
        </div>

        <hr className="border-slate-200 my-6 w-full" />

        <button
          className="flex justify-center items-center px-4 py-2 rounded-full
          bg-gradient-to-r from-blue-400 to-slate-600
           text-white "
          onClick={() => router.push(Urls.LOGIN)}
          disabled={isSubmitting}
        >
          Go to login
        </button>
      </div>
    </div>
  );
}
