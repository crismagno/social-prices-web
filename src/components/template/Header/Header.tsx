import Title from "../Title/Title";

interface Props {
  title: string;
  subtitle?: string;
}

const Header: React.FC<Props> = ({ subtitle, title }) => {
  return (
    <div>
      <Title subtitle={subtitle} title={title} />
    </div>
  );
};

export default Header;
