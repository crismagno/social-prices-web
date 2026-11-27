"use client";

import { Control, Controller } from "react-hook-form";

import RichTextEditor from "../../../common/RichText/RichTextEditor";

interface Props<T> {
  controller: {
    control: Control<any>;
    name: keyof T | string;
  };
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  divClassName?: string;
  labelClassName?: string;
  errorMessage?: string;
}

/** A form field with the text editor: formatting, lists, links and emojis. */
export function RichTextCustomAntd<T extends object = any>({
  label,
  controller,
  placeholder,
  disabled,
  divClassName,
  labelClassName,
  errorMessage,
}: Props<T>) {
  return (
    <div
      className={
        divClassName
          ? `${divClassName} flex flex-col `
          : `flex flex-col mt-4 mr-5`
      }
    >
      <label className={`text-sm ${labelClassName ?? ""}`}>{label}</label>

      <Controller
        control={controller.control}
        name={controller.name as string}
        render={({ field: { onChange, value } }) => (
          <RichTextEditor
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      />

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500 px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
