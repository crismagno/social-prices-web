import HrCustom from "../HrCustom/HrCustom";

interface Props {
  title?: any;
  extraHeader?: any;
  children?: any;
  className?: string;
  subClassName?: string;
}

const ContainerTitle: React.FC<Props> = ({
  title,
  extraHeader,
  children,
  className = "",
  subClassName = "",
}) => {
  subClassName = subClassName ? subClassName : "flex justify-between items-end";

  return (
    <div className={`${className} w-full`}>
      <div className={subClassName}>
        <label>{title}</label>

        {extraHeader}
      </div>

      <HrCustom className="mt-2 mb-0" />

      {children}
    </div>
  );
};

export default ContainerTitle;
