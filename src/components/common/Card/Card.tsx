import React from "react";

interface Props {
  className?: string;
  children?: any;
}

const Card: React.FC<Props> = ({ className = "", children }) => {
  return (
    <div
      className={`
        dark:bg-slate-700 bg-white
        p-5 relative
        rounded-xl shadow-md ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
