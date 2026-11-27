"use client";

import { Radio } from "antd";

export interface IChoice<T extends string> {
  value: T;
  label: string;
  /** What the choice does, under its name. */
  hint?: string;
}

interface Props<T extends string> {
  value: T;
  options: IChoice<T>[];
  onChange: (value: T) => void;
}

/**
 * A choice among a few, one under the other: each name is read whole and
 * says what it does, however narrow the panel is.
 */
const ChoiceList = <T extends string>({
  value,
  options,
  onChange,
}: Props<T>) => (
  <Radio.Group
    className="w-full"
    value={value}
    onChange={(event) => onChange(event.target.value as T)}
  >
    <div className="flex flex-col gap-2">
      {options.map((option: IChoice<T>) => {
        const isOn: boolean = option.value === value;

        return (
          // Not a <label>: the radio draws its own, and they cannot nest.
          <div
            key={option.value}
            role="presentation"
            onClick={() => onChange(option.value)}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
              isOn
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
            }`}
          >
            <Radio value={option.value} className="mt-0.5" />
            <span className="min-w-0">
              <span className="block font-medium">{option.label}</span>
              {option.hint && (
                <span className="block text-xs opacity-70">{option.hint}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  </Radio.Group>
);

export default ChoiceList;
