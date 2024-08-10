import { ReactElement } from "react";

import Title from "../Title/Title";

interface Props {
  title: string | ReactElement;
  subtitle?: string;
  hasBackButton?: boolean;
}

const Header: React.FC<Props> = ({ subtitle, title, hasBackButton }) => {
  return (
    <Title subtitle={subtitle} title={title} hasBackButton={hasBackButton} />
  );
};

export default Header;
