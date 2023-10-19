"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import Button from "../../components/common/Button/Button";
import HrCustom from "../../components/common/HrCustom/HrCustom";
import Loading from "../../components/common/Loading/Loading";
import WormAlert, {
  IWormAlertRefProps,
  WormAlertTypeEnum,
} from "../../components/common/WorkAlert/WormAlert";
import { usersServiceMethodsInstance } from "../../services/social-prices-api/users/user-service.methods";
import Urls from "../../shared/common/routes-app/routes-app";

export default function RecoverPassword() {
  const router = useRouter();

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
          5,
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

  const handleRecoverPassword = async (event: any) => {
    event.preventDefault();

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
          className="flex flex-col justify-center items-center 
          w-full h-full p-3 shadow-2xl bg-white rounded-lg"
        >
          <span className="text-lg text-center mt-6">Recover Password</span>

          <form onSubmit={handleSendRecoverPasswordCode} className="w-full">
            <AuthInput
              value={email}
              onChange={setEmail}
              placeholder="Type your email"
              disabled={isSubmitting}
              label="Email"
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
                "Send recover password code"
              )}
            </button>
          </form>

          {isSentRecoverPassword && (
            <form onSubmit={handleRecoverPassword} className="w-full h-full">
              <HrCustom className="my-6" />

              <AuthInput
                value={codeValue}
                onChange={setCodeValue}
                placeholder="Type code value"
                disabled={isSubmitting}
                label="Code"
                divClassName="w-full"
              />

              <AuthInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Type your new password"
                disabled={isSubmitting}
                label="New Password"
                divClassName="w-full"
                type="password"
                useShowPassword
              />

              <Button
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
                Recover
              </Button>
            </form>
          )}
        </div>

        <HrCustom />

        <Button
          className="text-sm rounded-2xl px-4"
          onClick={() => router.push(Urls.LOGIN)}
          disabled={isSubmitting}
          color="primary"
        >
          Go to login
        </Button>
      </div>
    </div>
  );
}
