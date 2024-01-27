import { SelectHTMLAttributes } from "react";

import { Select } from "antd";
import { RegisterOptions, UseFormRegister } from "react-hook-form";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  selectClassName?: string;
  divClassName?: string;
  useShowPassword?: boolean;
  labelClassName?: string;
  register: UseFormRegister;
  registerName: any;
  registerOptions?: RegisterOptions;
  defaultValue?: any;
  errorMessage?: string;
}

const SelectAntd: React.FC<Props> = ({
  label,
  selectClassName,
  divClassName,
  labelClassName,
  children,
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

      <Select
        className={`
					px-4 py-1.5 bg-white rounded-lg mt-1 w-full
					 focus:bg-slate-50 border border-slate-200 focus:border-blue-100
					 transition-all ${selectClassName}`}
        defaultValue={defaultValue}
        {...register(registerName, { ...registerOptions })}
        {...props}
      >
        {children}
      </Select>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default SelectAntd;
