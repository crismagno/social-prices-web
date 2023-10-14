import {
  DetailedHTMLProps,
  OptionHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

interface Props {
  label?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  selectClassName?: string;
  divClassName?: string;
  useShowPassword?: boolean;
  className?: string;
  labelClassName?: string;
  children?: any;
}

const DescriptionSelect: React.FC<
  | Props
  | DetailedHTMLProps<
      SelectHTMLAttributes<HTMLSelectElement>,
      HTMLSelectElement
    >
> = ({
  label,
  value,
  onChange,
  required,
  selectClassName,
  divClassName,
  labelClassName,
  children,
  ...props
}) => {
  return (
    <div className={`flex flex-col mt-4 mr-5 ${divClassName}`}>
      <label className={`text-sm ${labelClassName}`}>{label}</label>

      <select
        className={`
					px-4 py-2 bg-white rounded-lg mt-1 w-full
					 focus:bg-slate-50 border border-slate-200 focus:border-blue-100
					 transition-all ${selectClassName}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default DescriptionSelect;

interface PropsOption {
  value: any;
  children?: any;
}

export const DescriptionSelectOption: React.FC<
  | PropsOption
  | DetailedHTMLProps<
      OptionHTMLAttributes<HTMLOptionElement>,
      HTMLOptionElement
    >
> = ({ value, children, ...props }) => {
  return (
    <option value={value} {...props}>
      {children ?? value}
    </option>
  );
};
