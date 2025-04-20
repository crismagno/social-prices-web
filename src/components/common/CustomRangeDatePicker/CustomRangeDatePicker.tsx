import { DatePicker } from "antd";
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
}

export const CustomRangeDatePicker: React.FC<Props> = ({
  onChange,
  label,
  showTime = false,
  defaultValue,
  format,
  labelClassName = "",
}) => {
  return (
    <div>
      {label && (
        <label className={`mr-2 font-bold ${labelClassName}`}>{label}</label>
      )}
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
    </div>
  );
};
