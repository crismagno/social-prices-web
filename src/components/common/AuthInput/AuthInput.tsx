import { DetailedHTMLProps, InputHTMLAttributes, useState } from "react";

import { IconEye, IconEyeSlash } from "../icons/icons";

interface Props {
  label?: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  inputClassName?: string;
  divClassName?: string;
  useShowPassword?: boolean;
}

const AuthInput: React.FC<
  | Props
  | DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = ({
  label,
  type,
  value,
  onChange,
  required,
  inputClassName,
  divClassName,
  useShowPassword,
  ...props
}) => {
  const [inputType, setInputType] = useState(type);

  return (
    <div className={`flex flex-col mt-4  ${divClassName} relative`}>
      <label>{label}</label>

      <input
        className={`
					px-4 py-3 bg-gray-100 rounded-lg mt-2
					 focus:bg-white focus:border-blue-100
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

export default AuthInput;
