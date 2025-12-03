"use client";

import React from "react";

interface Props {
  label: string;
  description?: any;
  className?: string;
  leftIcon?: any;
  containerClassName?: string;
}

const Description: React.FC<Props> = ({
  label,
  description,
  className,
  leftIcon,
  containerClassName = "mt-4",
}) => {
  return (
    <div className={`flex items-start ${containerClassName}`}>
      {leftIcon && <span className="mr-3">{leftIcon}</span>}
      <div className={`flex flex-col ${className}`}>
        <label className="">{label}</label>
        {typeof description === "string" ? (
          <span className="text-sm text-gray-500">{description}</span>
        ) : (
          description
        )}
      </div>
    </div>
  );
};

export default Description;
