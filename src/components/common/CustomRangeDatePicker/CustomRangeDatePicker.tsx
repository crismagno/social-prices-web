import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

interface Props {
  label?: string;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  showTime?: boolean;
}

export const CustomRangeDatePicker: React.FC<Props> = ({
  onChange,
  label,
  showTime = false,
}) => {
  return (
    <div>
      {label && <label className="mr-2 font-bold">{label}</label>}
      <RangePicker
        showTime={showTime}
        onChange={(value) => {
          onChange(value?.[0]?.toDate() ?? null, value?.[1]?.toDate() ?? null);
        }}
      />
    </div>
  );
};
