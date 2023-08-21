import Link from "next/link";

interface Props {
  icon?: any;
  text?: string;
  url?: string;
  children?: any;
  className?: string;
  title?: string;
  onClick?: () => Promise<void> | void;
}

const NavigationItem: React.FC<Props> = ({
  icon,
  text,
  url,
  children,
  className,
  title,
  onClick,
}) => {
  const classNameDefault =
    "flex flex-col justify-center items-center cursor-pointer";

  const renderLink = () => {
    return children ? (
      children
    ) : (
      <>
        <div>{icon}</div>
        <span className="text-sm">{text}</span>
      </>
    );
  };

  return (
    <li
      onClick={onClick}
      className={`
      flex items-center justify-center
       text-slate-800 hover:bg-gray-100 w-28 h-20 
       dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700
       ${className}`}
      title={title}
    >
      {url ? (
        <Link href={url} className={classNameDefault}>
          {renderLink()}
        </Link>
      ) : (
        <div className={classNameDefault}>{renderLink()}</div>
      )}
    </li>
  );
};

export default NavigationItem;
