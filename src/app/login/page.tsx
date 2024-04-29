"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import handleClientError from "../../components/common/handleClientError/handleClientError";
import Loading from "../../components/common/Loading/Loading";
import useAuthData from "../../data/context/auth/useAuthData";
import useForceRedirect from "../../hooks/useForceRedirect/useForceRedirect";
import LoginEnum from "../../shared/common/enums/login.enum";
import Urls from "../../shared/common/routes-app/routes-app";

export default function LoginPage() {
  useForceRedirect();

  const { loginGoogle, login, create } = useAuthData();

  const router = useRouter();

  const [mode, setMode] = useState<LoginEnum.Mode>(LoginEnum.Mode.LOGIN);

  const [email, setEmail] = useState<string>();

  const [password, setPassword] = useState<string>();

  const [confirmPassword, setConfirmPassword] = useState<string>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLoginOrCreate = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email || !password) {
        throw new Error("Please enter with your credentials!");
      }

      if (mode === LoginEnum.Mode.CREATE && password !== confirmPassword) {
        throw new Error("Please check confirm password!");
      }

      if (mode === LoginEnum.Mode.CREATE) {
        await create(email, password);
        return;
      }

      await login(email, password);
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
        <img
          src="https://source.unsplash.com/random"
          alt="Images on side"
          className="h-screen w-full object-cover"
        />
      </div>

      {isSubmitting && (
        <div className="h-full w-full absolute flex justify-center items-center bg-gray-500/30 top-0 z-50">
          <Loading />
        </div>
      )}

      <form
        onSubmit={handleLoginOrCreate}
        className="relative flex flex-col justify-center m-10 w-full md:w-1/2 lg:w-1/3"
      >
        <h1 className="text-xl font-bold text-center">
          {mode === LoginEnum.Mode.LOGIN
            ? "Enter with your account"
            : "Create a new account"}
        </h1>

        <AuthInput
          value={email}
          onChange={setEmail}
          label="User"
          type="text"
          placeholder="Type email or email"
        />

        <AuthInput
          value={password}
          onChange={setPassword}
          label="Password"
          type="password"
          placeholder="Type your password"
          useShowPassword
        />

        {mode === LoginEnum.Mode.CREATE && (
          <AuthInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            label="Confirm Password"
            type="password"
            placeholder="Type confirm your password"
            useShowPassword
          />
        )}

        <a
          className="text-slate-500 hover:text-slate-800 text-sm cursor-pointer text-end mt-2 mr-2"
          onClick={() => router.push(Urls.RECOVER_PASSWORD)}
        >
          Recover password
        </a>

        <button
          className="mt-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-3 px-4"
          onClick={handleLoginOrCreate}
        >
          {mode === LoginEnum.Mode.LOGIN ? "Login" : "Create"}
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
          Enter with Google
        </button>

        <p className="mt-8">
          {mode === LoginEnum.Mode.LOGIN
            ? "Don`t you have a account?"
            : "I have account already!"}
          <a
            className="text-blue-500 hover:text-blue-600 font-semibold cursor-pointer ml-2"
            onClick={() =>
              setMode(
                mode === LoginEnum.Mode.LOGIN
                  ? LoginEnum.Mode.CREATE
                  : LoginEnum.Mode.LOGIN
              )
            }
          >
            {mode === LoginEnum.Mode.LOGIN
              ? "Create your credentials"
              : "Enter with my credentials"}
          </a>
        </p>
      </form>
    </div>
  );
}
