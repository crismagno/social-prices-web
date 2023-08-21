interface Props {
  title: string;
  subtitle: string;
}

const Title: React.FC<Props> = ({ subtitle, title }) => {
  return (
    <div>
      <h1 className="font-black text-3xl text-gray-800">{title}</h1>
      <h2 className="font-light text-sm text-gray-600">{subtitle}</h2>
    </div>
  );
};

export default Title;
