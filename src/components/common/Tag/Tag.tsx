import React from "react";

interface Props {
  children?: any;
}
const Tag: React.FC<Props> = ({ children }) => {
  return (
    <div className="text-sm text-gray-500 border border-gray-300 rounded-md px-3 py-1 mr-2">
      {children}
    </div>
  );
};

export default Tag;
