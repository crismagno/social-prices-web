import Title from "../Title/Title";

interface Props {
  title: string;
  subtitle?: string;
  hasBackButton?: boolean;
}

const Header: React.FC<Props> = ({ subtitle, title, hasBackButton }) => {
  return (
    <Title subtitle={subtitle} title={title} hasBackButton={hasBackButton} />
  );
};

export default Header;
