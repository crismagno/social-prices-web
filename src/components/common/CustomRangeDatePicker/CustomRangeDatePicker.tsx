import { DatePicker, Select, Space } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import moment from "moment";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

interface Props {
  label?: string;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  showTime?: boolean;
  defaultValue?: [moment.Moment, moment.Moment];
  format?: string;
  labelClassName?: string;
  select?: {
    options: { label: string; value: string }[];
    value?: string;
    onChange?: (value: string) => void;
  };
}

export const CustomRangeDatePicker: React.FC<Props> = ({
  onChange,
  label,
  showTime = false,
  defaultValue,
  format,
  labelClassName = "",
  select,
}) => {
  const rangeDatePicker: JSX.Element = (
    <RangePicker
      defaultValue={
        defaultValue && [
          dayjs(defaultValue?.[0].format(format), format),
          dayjs(defaultValue?.[1].format(format), format),
        ]
      }
      format={format}
      showTime={showTime}
      onChange={(value) => {
        onChange(value?.[0]?.toDate() ?? null, value?.[1]?.toDate() ?? null);
      }}
    />
  );

  if (label) {
    return (
      <>
        <label className={`font-bold ${labelClassName}`}>{label}</label>
        {rangeDatePicker}
      </>
    );
  }

  if (select?.options?.length) {
    return (
      <Space.Compact style={{ width: "100%" }}>
        <Select
          onChange={select.onChange}
          value={select.value}
          style={{ width: 170 }}
        >
          {select.options.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              <b>{option.label}</b>
            </Select.Option>
          ))}
        </Select>
        {rangeDatePicker}
      </Space.Compact>
    );
  }

  return rangeDatePicker;
};
