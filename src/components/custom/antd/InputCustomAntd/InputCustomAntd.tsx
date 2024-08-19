import { Input, InputProps } from "antd";
import { Control, Controller } from "react-hook-form";

interface Props<T> extends InputProps {
  controller: {
    control: Control<any>;
    name: keyof T | string;
  };
  label?: any;
  divClassName?: string;
  labelClassName?: string;
  errorMessage?: string;
}

export function InputCustomAntd<T extends object = any>({
  label,
  controller,
  divClassName,
  labelClassName,
  errorMessage,
  children,
  ...props
}: Props<T>) {
  return (
    <div
      className={
        divClassName
          ? `${divClassName} flex flex-col `
          : `flex flex-col mt-4 mr-5`
      }
    >
      <label className={`text-sm ${labelClassName}`}>{label}</label>

      <Controller
        control={controller.control}
        name={controller.name}
        render={({ field: { onChange, value, name, ref } }) => {
          if (props.type === "password") {
            return (
              <Input.Password
                className="w-full"
                onChange={onChange}
                name={name}
                value={value}
                ref={ref}
                {...props}
              />
            );
          } else {
            return (
              <Input
                className="w-full"
                onChange={onChange}
                name={name}
                value={value}
                ref={ref}
                {...props}
              />
            );
          }
        }}
      ></Controller>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
