import { InputHTMLAttributes, useState } from "react";

import { IconEye, IconEyeSlash } from "../icons/icons";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onChange?: (value: any) => void;
  required?: boolean;
  inputClassName?: string;
  divClassName?: string;
  useShowPassword?: boolean;
  labelClassName?: string;
}

const DescriptionInput: React.FC<Props> = ({
  label,
  type,
  value,
  onChange,
  required,
  inputClassName,
  divClassName,
  useShowPassword,
  labelClassName,
  ...props
}) => {
  const [inputType, setInputType] = useState<string | undefined>(type);

  return (
    <div className={`flex flex-col mt-4 mr-5 ${divClassName}`}>
      <label className={`text-sm ${labelClassName}`}>{label}</label>

      <input
        className={`
					px-4 py-1 bg-white rounded-lg mt-1 w-full text-sm
					 focus:bg-slate-50 border border-slate-300 focus:border-blue-100 hover:border-blue-300
					 transition-all ${inputClassName}`}
        value={value}
        type={inputType}
        onChange={(e) => onChange(e.target.value)}
        required={required}
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
    </div>
  );
};

export default DescriptionInput;
