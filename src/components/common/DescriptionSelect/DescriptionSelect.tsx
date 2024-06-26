import {
  DetailedHTMLProps,
  OptionHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  selectClassName?: string;
  divClassName?: string;
  useShowPassword?: boolean;
  labelClassName?: string;
  onChange: (value: any) => void;
}

const DescriptionSelect: React.FC<Props> = ({
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
