"use client";

import useAppData from "../../../data/context/app/useAppData";
import ForceAuth from "../../auth/ForceAuth/ForceAuth";
import Content from "../Content/Content";
import Header from "../Header/Header";
import Navigation from "../Navigation/Navigation";

interface Props {
  title: string;
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
      <div className={`${theme} relative flex flex-col h-screen`}>
        <div className="p-7 bg-gray-100 dark:bg-slate-800 flex-grow pb-32">
          <Header
            subtitle={subtitle}
            title={title}
            hasBackButton={hasBackButton}
          />
          <Content>{children}</Content>
        </div>
        <Navigation />
      </div>
    </ForceAuth>
  );
};

export default Layout;
