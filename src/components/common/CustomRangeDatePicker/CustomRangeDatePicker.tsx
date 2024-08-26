import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

interface Props {
  label?: string;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  showTime?: boolean;
  value?: any;
}

export const CustomRangeDatePicker: React.FC<Props> = ({
  onChange,
  label,
  showTime = false,
  value,
  ...props
}) => {
  return (
    <div>
      {label && <label className="mr-2 font-bold">{label}</label>}
      <RangePicker
        value={value}
        showTime={showTime}
        onChange={(value) => {
          onChange(value?.[0]?.toDate() ?? null, value?.[1]?.toDate() ?? null);
        }}
        {...props}
      />
    </div>
  );
};
