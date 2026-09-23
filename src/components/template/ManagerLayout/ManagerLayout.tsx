"use client";

import { ReactElement } from "react";

import ForceManagerAuth from "../../auth/ForceManagerAuth/ForceManagerAuth";
import ManagerSidebar from "./ManagerSidebar/ManagerSidebar";

interface Props {
  title: string | ReactElement;
  subtitle?: string;
  children?: any;
}

const ManagerLayout: React.FC<Props> = ({ title, subtitle, children }) => {
  return (
    <ForceManagerAuth>
      <div className="relative flex flex-row min-h-screen bg-gray-100">
        <ManagerSidebar />

        <main className="flex-grow p-7 overflow-x-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

            {subtitle && (
              <h2 className="text-sm text-gray-500 mt-1">{subtitle}</h2>
            )}
          </header>

          {children}
        </main>
      </div>
    </ForceManagerAuth>
  );
};

export default ManagerLayout;
