import { BackButton } from "../../common/BackButton/BackButton";

interface Props {
  title: string;
  subtitle?: string;
  hasBackButton?: boolean;
}

const Title: React.FC<Props> = ({ subtitle, title, hasBackButton }) => {
  return (
    <div className="flex justify-between items-end">
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

      {hasBackButton && (
        <div>
          <BackButton />
        </div>
      )}
    </div>
  );
};

export default Title;
