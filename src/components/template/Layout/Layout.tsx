"use client";

import useAppData from "../../../data/hook/useAppData";
import ForceAuth from "../../auth/ForceAuth/ForceAuth";
import Content from "../Content/Content";
import Header from "../Header/Header";
import Navigation from "../Navigation/Navigation";

interface Props {
  title: string;
  subtitle?: string;
  children?: any;
}

const Layout: React.FC<Props> = ({ subtitle, title, children }) => {
  const { theme } = useAppData();

  return (
    <ForceAuth>
      <div className={`${theme} flex flex-col h-screen w-screen`}>
        <div className="p-7 bg-gray-100 dark:bg-slate-800 flex-grow">
          <Header subtitle={subtitle} title={title} />
          <Content>{children}</Content>
        </div>
        <Navigation />
      </div>
    </ForceAuth>
  );
};

export default Layout;
