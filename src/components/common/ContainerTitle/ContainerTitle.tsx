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
    <div className={`${className} w-full`}>
      <div className="flex justify-between items-end">
        <label>{title}</label>

        {extraHeader}
      </div>

      <HrCustom className="mt-2 mb-0" />

      {children}
    </div>
  );
};

export default ContainerTitle;
