import { Checkbox, CheckboxProps } from "antd";
import { Control, Controller } from "react-hook-form";

interface Props<T> extends CheckboxProps {
  controller: {
    control: Control<any>;
    name: keyof T | string;
  };
  label?: string;
  divClassName?: string;
  labelClassName?: string;
  errorMessage?: string;
}

export function CheckboxCustomAntd<T extends object = any>({
  label,
  controller,
  divClassName,
  labelClassName,
  errorMessage,
  children,
  ...props
}: Props<T>) {
  return (
    <div className={`flex flex-col mt-4 mr-5 ${divClassName}`}>
      <label className={`text-sm ${labelClassName}`} for={controller.name}>
        {label}
      </label>

      <Controller
        control={controller.control}
        name={controller.name}
        render={({ field: { onChange, value, name, ref } }) => (
          <Checkbox
            id={controller.name}
            onChange={onChange}
            name={name}
            value={value}
            checked={!!value}
            ref={ref}
            {...props}
          ></Checkbox>
        )}
      ></Controller>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
