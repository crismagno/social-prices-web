import { InputHTMLAttributes } from "react";

import { Input } from "antd";
import { CompoundedComponent } from "antd/es/float-button/interface";
import { RegisterOptions, UseFormRegister } from "react-hook-form";

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

const InputAntd: React.FC<Props> = ({
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
  return (
    <div className={`flex flex-col mt-4 mr-5 ${divClassName}`}>
      <label className={`text-sm ${labelClassName}`}>{label}</label>

      <Input
        className={inputClassName}
        type={type}
        defaultValue={defaultValue}
        {...register(registerName, { ...registerOptions })}
        {...(props as CompoundedComponent)}
      />

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default InputAntd;
