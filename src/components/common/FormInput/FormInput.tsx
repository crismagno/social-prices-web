import { InputHTMLAttributes, useState } from "react";

import { RegisterOptions, UseFormRegister } from "react-hook-form";

import { IconEye, IconEyeSlash } from "../icons/icons";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  inputClassName?: string;
  divClassName?: string;
  useShowPassword?: boolean;
  labelClassName?: string;
  register: UseFormRegister<any>;
  registerName: any;
  registerOptions?: RegisterOptions;
  defaultValue?: any;
  errorMessage?: string;
}

const FormInput: React.FC<Props> = ({
  label,
  type,
  value,
  inputClassName,
  divClassName,
  useShowPassword,
  labelClassName,
  register,
  registerName,
  registerOptions,
  defaultValue,
  errorMessage,
  ...props
}) => {
  const [inputType, setInputType] = useState<string | undefined>(type);

  return (
    <div className={`flex flex-col mt-4 mr-5 ${divClassName}`}>
      <label className={`text-sm ${labelClassName}`}>{label}</label>

      <input
        className={`
					px-4 py-2 bg-white rounded-lg mt-1 w-full
					 focus:bg-slate-50 border border-slate-300 focus:border-blue-100 hover:border-blue-300
					 transition-all ${inputClassName}`}
        type={inputType}
        defaultValue={defaultValue}
        {...register(registerName, { ...registerOptions })}
        {...props}
      />

      {useShowPassword && type === "password" && (
        <div
          className="absolute right-3 bottom-3 cursor-pointer"
          onClick={() =>
            setInputType(inputType === "password" ? "text" : "password")
          }
        >
          {inputType === "password" ? IconEyeSlash("w-5/6") : IconEye("w-5/6")}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormInput;
