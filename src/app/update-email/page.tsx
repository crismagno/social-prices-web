"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import Button from "../../components/common/Button/Button";
import handleClientError from "../../components/common/handleClientError/handleClientError";
import HrCustom from "../../components/common/HrCustom/HrCustom";
import Loading from "../../components/common/Loading/Loading";
import WormAlert, {
  IWormAlertRefProps,
  WormAlertTypeEnum,
} from "../../components/common/WorkAlert/WormAlert";
import useAuthData from "../../data/hook/useAuthData";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import IUser from "../../shared/business/users/user.interface";

export default function UpdateEmail() {
  const { updateUserSession } = useAuthData();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isSentUpdateEmail, setIsSentUpdateEmail] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const [newEmail, setNewEmail] = useState<string>("");

  const [codeValue, setCodeValue] = useState<string>("");

  const wormTextMessage: React.MutableRefObject<IWormAlertRefProps | null> =
    useRef(null);

  const handleSendUpdateEmailCode = async () => {
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

      await serviceMethodsInstance.usersServiceMethods.sendUpdateEmailCode(
        email
      );

      setIsSentUpdateEmail(true);

      wormTextMessage.current?.showWormText(
        "Code to update email was sent to your email.",
        3,
        WormAlertTypeEnum.SUCCESS
      );
    } catch (error: any) {
      wormTextMessage.current?.showWormText(
        "Error when attempt send update email code.",
        3,
        WormAlertTypeEnum.DANGER
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmail = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim() || !codeValue.trim() || !newEmail.trim()) {
        wormTextMessage.current?.showWormText(
          "Please fill input values.",
          3,
          WormAlertTypeEnum.WARNING
        );

        return;
      }

      const newUser: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateEmail({
          codeValue,
          email,
          newEmail,
        });

      wormTextMessage.current?.showWormText(
        "Your email has been reset.",
        3,
        WormAlertTypeEnum.SUCCESS
      );

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
      className="h-screen w-screen flex flex-col justify-center items-center 
        bg-gradient-to-r from-yellow-100 to-slate-200"
    >
      <div className="flex flex-col justify-center items-center lg:w-1/4 md:w-1/2">
        <WormAlert ref={wormTextMessage} className="my-3 w-full" />

        <div
          className="flex flex-col justify-center items-center 
          w-full h-full p-3 shadow-2xl bg-white rounded-lg"
        >
          <span className="text-lg text-center mt-6">Update Email</span>

          <form onSubmit={handleSendUpdateEmailCode} className="w-full">
            <AuthInput
              value={email}
              onChange={setEmail}
              placeholder="Type your email"
              disabled={isSubmitting}
              label="Email"
              divClassName="w-full"
            />

            <button
              className="px-4 py-2 mt-1 text-yellow-600 w-full text-sm "
              onClick={handleSendUpdateEmailCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading height={30} width={30} />
              ) : (
                "Send update email code"
              )}
            </button>
          </form>

          {isSentUpdateEmail && (
            <form onSubmit={handleUpdateEmail} className="w-full h-full">
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
                value={newEmail}
                onChange={setNewEmail}
                placeholder="Type your new email"
                disabled={isSubmitting}
                label="New Email"
                divClassName="w-full"
              />

              <Button
                className="justify-center items-center w-full mt-5 py-2"
                onClick={handleUpdateEmail}
                disabled={isSubmitting}
                color="warning"
                loading={{
                  isLoading: isSubmitting,
                  height: 30,
                  width: 30,
                }}
              >
                Update
              </Button>
            </form>
          )}
        </div>

        <HrCustom />

        <Button
          className="text-sm rounded-2xl px-4"
          onClick={() => router.back()}
          disabled={isSubmitting}
          color="warning"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
