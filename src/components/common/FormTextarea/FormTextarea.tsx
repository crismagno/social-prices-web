import { TextareaHTMLAttributes } from "react";

import { RegisterOptions, UseFormRegister } from "react-hook-form";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  inputClassName?: string;
  divClassName?: string;
  labelClassName?: string;
  register: UseFormRegister<any>;
  registerName: any;
  registerOptions?: RegisterOptions;
  defaultValue?: any;
  errorMessage?: string;
}

const FormTextarea: React.FC<Props> = ({
  label,
  inputClassName,
  divClassName,
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

      <textarea
        className={`
					px-4 py-1 bg-white rounded-lg mt-1 w-full text-sm
					 focus:bg-slate-50 border border-slate-300 focus:border-blue-100 hover:border-blue-300
					 transition-all ${inputClassName}`}
        defaultValue={defaultValue}
        {...register(registerName, { ...registerOptions })}
        {...props}
      ></textarea>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormTextarea;
