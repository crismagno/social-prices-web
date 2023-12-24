import { Button } from "antd";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  subtitle?: string;
  hasBackButton?: boolean;
}

const Title: React.FC<Props> = ({ subtitle, title, hasBackButton }) => {
  const router = useRouter();
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
          <Button className="z-50" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default Title;
