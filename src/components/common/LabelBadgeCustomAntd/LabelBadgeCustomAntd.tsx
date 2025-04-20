import { Badge } from "antd";

interface Props {
  label: string;
  color?: string;
  labelClassName?: string;
}
export const LabelBadgeCustomAntd: React.FC<Props> = ({
  label,
  color,
  labelClassName = "",
}) => {
  return (
    <>
      <span className={`mr-1 ${labelClassName}`}>{label}</span>
      <Badge color={color} />
    </>
  );
};
