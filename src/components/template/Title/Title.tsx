import { ReactElement } from "react";

import { BackButton } from "../../common/BackButton/BackButton";

interface Props {
  title: string | ReactElement;
  subtitle?: string;
  hasBackButton?: boolean;
}

const Title: React.FC<Props> = ({ subtitle, title, hasBackButton }) => {
  return (
    <div className="flex justify-between items-end">
      <div>
        <h1 className="font-black text-3xl text-gray-800 dark:text-gray-100 mb-1">
          {title}
        </h1>

        {subtitle && (
          <h2 className="font-light text-sm text-gray-600 dark:text-gray-200">
            {subtitle}
          </h2>
        )}
      </div>

      <div className="flex items-center">
        {hasBackButton && (
          <div>
            <BackButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default Title;
