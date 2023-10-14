import HrCustom from "../HrCustom/HrCustom";

interface Props {
  title?: any;
  extraHeader?: any;
  children?: any;
  className?: string;
}

const ContainerTitle: React.FC<Props> = ({
  title,
  extraHeader,
  children,
  className,
}) => {
  return (
    <div className={`my-1 ${className}`}>
      <div className="flex justify-between">
        <div>{title}</div>
        {extraHeader && <div>{extraHeader}</div>}
      </div>

      <HrCustom className="mt-2 mb-0" />

      <div>{children}</div>
    </div>
  );
};

export default ContainerTitle;
