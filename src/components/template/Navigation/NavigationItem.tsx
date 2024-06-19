import { Tooltip } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Loading from "../../common/Loading/Loading";

interface Props {
  icon?: any;
  text?: string;
  url?: string;
  children?: any;
  className?: string;
  title?: string;
  onClick?: () => Promise<void> | void;
  isLoading?: boolean;
}

const NavigationItem: React.FC<Props> = ({
  icon,
  text,
  url,
  children,
  className,
  title,
  onClick,
  isLoading,
}) => {
  const pathname = usePathname();

  const isActivePath: boolean = pathname === url;

  const classNameActiveLink = (): string => `
    bg-slate-100 hover:bg-slate-200 
    dark:bg-slate-700 dark:text-yellow-200 dark:hover:bg-slate-900 
    border-b-2 border-blue-500 transition-all text-blue-500 
  `;

  const classNameDefault: string = `flex flex-col justify-center items-center cursor-pointer ${
    isActivePath ? "text-blue-500 dark:text-yellow-200" : ""
  } hover:text-blue-500 dark:hover:text-yellow-200`;

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

  const loadingOrRenderLink = isLoading ? (
    <Loading width={30} height={30} />
  ) : (
    renderLink()
  );

  return (
    <li
      onClick={onClick}
      className={`
      flex items-center justify-center
       text-slate-800 hover:bg-gray-100 w-28 h-20 
       dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700
       hover:border-b-2 hover:border-blue-500 transition-all
       ${className} 
       ${isActivePath ? classNameActiveLink() : ""}`}
    >
      <Tooltip title={title}>
        {url ? (
          <Link href={url} className={classNameDefault}>
            {loadingOrRenderLink}
          </Link>
        ) : (
          <div className={classNameDefault}>{loadingOrRenderLink}</div>
        )}
      </Tooltip>
    </li>
  );
};

export default NavigationItem;
