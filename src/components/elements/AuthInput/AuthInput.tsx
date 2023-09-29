import { DetailedHTMLProps, InputHTMLAttributes } from "react";

interface Props {
  label: string;
  type: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  className?: string;
}

const AuthInput: React.FC<
  | Props
  | DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = ({ label, type, value, onChange, required, className, ...props }) => {
  return (
    <div className="flex flex-col mt-4">
      <label>{label}</label>
      <input
        className={`
					px-4 py-3 bg-gray-100 rounded-lg mt-2
					 focus:bg-white focus:border-blue-100
					 transition-all ${className}`}
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        {...props}
      />
    </div>
  );
};

export default AuthInput;
