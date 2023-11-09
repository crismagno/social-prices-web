interface Props {
  title: string;
  subtitle?: string;
}

const Title: React.FC<Props> = ({ subtitle, title }) => {
  return (
    <div>
      <h1 className="font-black text-3xl text-gray-800 dark:text-gray-100">
        {title}
      </h1>

      {subtitle && (
        <h2 className="font-light text-sm text-gray-600 dark:text-gray-200">
          {subtitle}
        </h2>
      )}
    </div>
  );
};

export default Title;
