import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

interface Props {
  label?: string;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
}

export const CustomRangeDatePicker: React.FC<Props> = ({ onChange, label }) => {
  return (
    <div>
      {label && <label className="mr-2">{label}</label>}
      <RangePicker
        showTime
        onChange={(value) => {
          onChange(value?.[0]?.toDate() ?? null, value?.[1]?.toDate() ?? null);
        }}
      />
    </div>
  );
};
