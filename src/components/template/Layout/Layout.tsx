"use client";

import { ReactElement } from "react";

import useAppData from "../../../data/context/app/useAppData";
import ForceAuth from "../../auth/ForceAuth/ForceAuth";
import Content from "../Content/Content";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

interface Props {
  title: string | ReactElement;
  subtitle?: string;
  children?: any;
  hasBackButton?: boolean;
}

const Layout: React.FC<Props> = ({
  subtitle,
  title,
  children,
  hasBackButton,
}) => {
  const {
    theme: { theme },
  } = useAppData();

  return (
    <ForceAuth>
      <div className={`${theme} relative flex flex-row min-h-screen`}>
        <Sidebar />

        <main className="p-7 bg-gray-100 dark:bg-slate-800 flex-grow min-w-0 overflow-x-auto">
          <Header
            subtitle={subtitle}
            title={title}
            hasBackButton={hasBackButton}
          />
          <Content>{children}</Content>
        </main>
      </div>
    </ForceAuth>
  );
};

export default Layout;
