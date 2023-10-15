import { useState } from "react";

import { IconChevronDown, IconChevronUp } from "../icons/icons";

interface Props {
  title?: string;
  extraHeader?: any;
  children?: any;
  headerClassName?: string;
  iconClassName?: string;
  bodyClassName?: string;
  className?: string;
  collapsed?: boolean;
}

const Collapse: React.FC<Props> = ({
  title,
  extraHeader,
  children,
  className,
  collapsed,
  iconClassName,
  headerClassName,
  bodyClassName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(!!collapsed);

  return (
    <div className={`my-1 ${className}`}>
      <div
        className={`flex items-center cursor-pointer px-3 py-2 border bg-slate-50 ${
          isCollapsed ? "rounded-lg" : "rounded-t-lg"
        } transition-all ${headerClassName}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className={`bg-transparent text-gray-500 mr-5 ${iconClassName}`}>
          {isCollapsed ? IconChevronDown() : IconChevronUp()}
        </span>

        <label className="mr-5">{title}</label>

        {extraHeader}
      </div>

      {!isCollapsed && (
        <div
          className={`px-3 py-2 border-b border-r border-l rounded-b-lg pb-5 ${bodyClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Collapse;
